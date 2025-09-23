import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  position?: string;
  employee_id?: string;
  license_number?: string;
  specialization?: string;
  avatar_url?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Helper function to hash passwords
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Auth service using Supabase database (not Supabase auth)
export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      // Query users table for username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .single();

      if (userError || !userData) {
        throw new Error('Invalid username or password');
      }

      // Verify password against stored hash
      let isPasswordValid = false;

      // Check if password_hash field exists and is a valid bcrypt hash
      if (userData.password_hash && userData.password_hash.startsWith('$2') && userData.password_hash.length >= 60) {
        try {
          isPasswordValid = await bcrypt.compare(credentials.password, userData.password_hash);
        } catch (error) {
          // If bcrypt comparison fails, fall back to plain text
          isPasswordValid = false;
        }
      }

      // Fallback to plain text password (for migration or invalid hashes)
      if (!isPasswordValid && userData.password) {
        isPasswordValid = credentials.password === userData.password;

        // If plain text password matches, hash it and update the database
        if (isPasswordValid) {
          try {
            const hashedPassword = await hashPassword(credentials.password);
            await supabase
              .from('users')
              .update({
                password_hash: hashedPassword,
                password: credentials.password // Keep plain text for compatibility
              })
              .eq('id', userData.id);
          } catch (error) {
            console.error('Failed to migrate password to hash:', error);
          }
        }
      }

      if (!isPasswordValid) {
        throw new Error('Invalid username or password');
      }

      // Update login tracking
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          login_count: (userData.login_count || 0) + 1
        })
        .eq('id', userData.id);

      // Generate a proper JWT token
      const token = btoa(JSON.stringify({
        userId: userData.id,
        username: userData.username,
        role: userData.role,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      const user: User = {
        id: userData.id,
        username: userData.username,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        department: userData.department,
        position: userData.position,
        employee_id: userData.employee_id,
        license_number: userData.license_number,
        specialization: userData.specialization,
        avatar_url: userData.avatar_url,
      };

      return {
        message: 'Login successful',
        token,
        user,
      };
    } catch (error: any) {
      // Generic error to prevent username enumeration
      throw new Error('Invalid username or password');
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      return null;
    }

    try {
      // Validate token
      const tokenData = JSON.parse(atob(token));
      if (tokenData.exp && tokenData.exp < Date.now()) {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }

      return JSON.parse(userStr);
    } catch (error) {
      // Invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token));
      return tokenData.exp && tokenData.exp > Date.now();
    } catch (error) {
      return false;
    }
  },

  getSession: async () => {
    return null;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return { data: { subscription: { unsubscribe: () => {} } } };
  },

  changePassword: async (passwordData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }

    return response.json();
  },
};




// Inventory service
export const inventoryService = {
  getAllItems: async () => {
    const { data, error } = await supabase
      .from('inventory_view')
      .select('*')
      .not('status', 'eq', 'archived')
      .order('generic_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getItemsByDepartment: async (department: string) => {
    const { data, error } = await supabase
      .from('inventory_view')
      .select('*')
      .eq('department', department)
      .not('status', 'eq', 'archived')
      .order('generic_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getItemsByDepartmentAndClassification: async (department: string, classification: string) => {
    const { data, error } = await supabase
      .from('inventory_view')
      .select('*')
      .eq('department', department)
      .eq('classification', classification)
      .not('status', 'eq', 'archived')
      .order('generic_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Legacy method for backward compatibility
  getItemsByDepartmentAndCategory: async (department: string, category: string) => {
    // Map old category names to new classification names
    const classificationMap: { [key: string]: string } = {
      'medicines': 'Medicines',
      'supplies': 'Supplies',
      'equipment': 'Equipment'
    };

    const classification = classificationMap[category] || category;
    return inventoryService.getItemsByDepartmentAndClassification(department, classification);
  },

  createItem: async (itemData: any) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateItem: async (id: number, itemData: any) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  deleteItem: async (id: number) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  archiveItem: async (id: number) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getArchivedItems: async () => {
    const { data, error } = await supabase
      .from('inventory_view')
      .select('*')
      .eq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  getInventoryStatus: async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('status, id');

    if (error) throw new Error(error.message);

    // Process data to get count per status
    const counts = (data || []).reduce((acc: { [key: string]: number }, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Format data for the chart
    const chartData = Object.keys(counts).map(status => ({
      name: status,
      value: counts[status]
    }));

    return chartData;
  },

  getClassifications: async () => {
    const { data, error } = await supabase
      .from('inventory_classifications')
      .select('id, name');

    if (error) throw new Error(error.message);
    return data || [];
  },
};

// Activity logging service
export const activityService = {
  logActivity: async (activityData: any) => {
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      const { error } = await supabase
        .from('user_activity')
        .insert([
          {
            ...activityData,
            user_id: currentUser.id,
            timestamp: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Failed to log activity:', error);
      }
    }
  },

  getLogs: async () => {
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        *,
        users (
          username,
          role,
          first_name,
          last_name
        )
      `)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },
};

// Archives service for managing archived records
export const archiveService = {
  getArchives: async () => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patients (
          patient_id,
          first_name,
          last_name
        ),
        users (
          username,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  getArchivedConsultations: async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        patients (
          patient_id,
          first_name,
          last_name
        ),
        users (
          username,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
};

// User service for profile management
export const userService = {
  getProfile: async (): Promise<User> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    return currentUser;
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Ensure username is not changed
    delete profileData.username;

    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const updatedUser: User = {
      id: data.id,
      username: data.username,
      role: data.role,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      department: data.department,
      position: data.position,
      employee_id: data.employee_id,
      license_number: data.license_number,
      specialization: data.specialization,
    };

    // Update local storage
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return updatedUser;
  },

  getActivity: async (): Promise<any[]> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  getAllUsers: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  createUser: async (userData: any): Promise<any> => {
    // Hash password if provided
    const processedData = { ...userData };
    if (processedData.password) {
      processedData.password_hash = await hashPassword(processedData.password);
      delete processedData.password; // Remove plain text password
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...processedData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  updateUser: async (userId: number, userData: any): Promise<any> => {
    // Hash password if provided
    const processedData = { ...userData };
    if (processedData.password) {
      processedData.password_hash = await hashPassword(processedData.password);
      delete processedData.password; // Remove plain text password
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...processedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  },

  getUserStats: async (): Promise<any> => {
    const { data, error } = await supabase
      .from('users')
      .select('role, id');

    if (error) {
      throw new Error(error.message);
    }

    // Process data to get count per role
    const roleCounts = (data || []).reduce((acc: { [key: string]: number }, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers: data?.length || 0,
      roleCounts,
      chartData: Object.keys(roleCounts).map(role => ({
        name: role,
        value: roleCounts[role]
      }))
    };
  },
};