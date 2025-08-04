const supabase = require('../config/supabase');

/**
 * Helper functions for common Supabase operations
 */

// Generic function to get all records from a table
exports.getAllRecords = async (tableName, options = {}) => {
  try {
    let query = supabase.from(tableName).select('*');
    
    // Apply filters if provided
    if (options.filter) {
      Object.keys(options.filter).forEach(key => {
        query = query.eq(key, options.filter[key]);
      });
    }
    
    // Apply ordering if provided
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending !== false 
      });
    }
    
    // Apply pagination if provided
    if (options.page && options.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { data, count };
  } catch (error) {
    throw new Error(`Error fetching records from ${tableName}: ${error.message}`);
  }
};

// Generic function to get a single record by ID
exports.getRecordById = async (tableName, id) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    throw new Error(`Error fetching record from ${tableName}: ${error.message}`);
  }
};

// Generic function to create a new record
exports.createRecord = async (tableName, recordData) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([recordData])
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    throw new Error(`Error creating record in ${tableName}: ${error.message}`);
  }
};

// Generic function to update a record
exports.updateRecord = async (tableName, id, updateData) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    throw new Error(`Error updating record in ${tableName}: ${error.message}`);
  }
};

// Generic function to delete a record
exports.deleteRecord = async (tableName, id) => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    throw new Error(`Error deleting record from ${tableName}: ${error.message}`);
  }
};

// Function to handle file uploads to Supabase Storage
exports.uploadFile = async (bucketName, filePath, file) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

// Function to get public URL for a file
exports.getPublicUrl = (bucketName, filePath) => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};