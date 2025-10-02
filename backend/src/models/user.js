import { db } from '../db.js';

class User {
  static async findOne(query) {
    try {
      const { email, phone } = query;
      let sql = 'SELECT * FROM users WHERE ';
      let params = [];
      
      if (email) {
        sql += 'email = ?';
        params.push(email);
      } else if (phone) {
        sql += 'phone = ?';
        params.push(phone);
      } else {
        return null;
      }
      
      const user = await db.get(sql, params);
      if (user) {
        // Add save method to the user object
        user.save = async function() {
          return await User.findByIdAndUpdate(this.id, this);
        };
      }
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  static async create(userData) {
    try {
      const {
        email,
        phone,
        otp,
        otpExpires,
        otpType,
        isVerified = false,
        subscription = 'free',
        subscriptionExpires = null
      } = userData;

      const sql = `
        INSERT INTO users (email, phone, otp, otpExpires, otpType, isVerified, subscription, subscriptionExpires)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await db.run(sql, [
        email || null,
        phone || null,
        otp,
        otpExpires ? otpExpires.toISOString() : null,
        otpType,
        isVerified ? 1 : 0,
        subscription,
        subscriptionExpires ? subscriptionExpires.toISOString() : null
      ]);

      // Return the created user with save method
      const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      if (user) {
        user.save = async function() {
          return await User.findByIdAndUpdate(this.id, this);
        };
      }
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      const {
        email,
        phone,
        otp,
        otpExpires,
        otpType,
        isVerified,
        subscription,
        subscriptionExpires
      } = updateData;

      const updates = [];
      const params = [];

      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        params.push(phone);
      }
      if (otp !== undefined) {
        updates.push('otp = ?');
        params.push(otp);
      }
      if (otpExpires !== undefined) {
        updates.push('otpExpires = ?');
        params.push(otpExpires ? otpExpires.toISOString() : null);
      }
      if (otpType !== undefined) {
        updates.push('otpType = ?');
        params.push(otpType);
      }
      if (isVerified !== undefined) {
        updates.push('isVerified = ?');
        params.push(isVerified ? 1 : 0);
      }
      if (subscription !== undefined) {
        updates.push('subscription = ?');
        params.push(subscription);
      }
      if (subscriptionExpires !== undefined) {
        updates.push('subscriptionExpires = ?');
        params.push(subscriptionExpires ? subscriptionExpires.toISOString() : null);
      }

      updates.push('updatedAt = ?');
      params.push(new Date().toISOString());

      params.push(id);

      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await db.run(sql, params);

      const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
      if (user) {
        user.save = async function() {
          return await User.findByIdAndUpdate(this.id, this);
        };
      }
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

export default User;
