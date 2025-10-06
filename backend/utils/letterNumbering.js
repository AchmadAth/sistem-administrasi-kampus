const { Letter } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate letter number in format: [Year]/[Month]/[LetterType]/[SequentialNumber]
 * Example: 2025/10/SKA/001
 * 
 * @param {String} letterType - Type of letter (e.g., 'SKA', 'SKPI')
 * @returns {Promise<String>} Generated letter number
 */
const generateLetterNumber = async (letterType) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get the prefix for this letter type and year/month
    const prefix = `${year}/${month}/${letterType}/`;
    
    // Find the highest sequential number for this year/month/type
    const lastLetter = await Letter.findOne({
      where: {
        letterType,
        letterNumber: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [['letterNumber', 'DESC']],
    });

    let sequentialNumber = 1;

    if (lastLetter && lastLetter.letterNumber) {
      // Extract the sequential number from the last letter
      const parts = lastLetter.letterNumber.split('/');
      if (parts.length === 4) {
        const lastSeq = parseInt(parts[3], 10);
        if (!isNaN(lastSeq)) {
          sequentialNumber = lastSeq + 1;
        }
      }
    }

    // Format sequential number with leading zeros (3 digits)
    const formattedSeq = String(sequentialNumber).padStart(3, '0');
    
    return `${prefix}${formattedSeq}`;
  } catch (error) {
    console.error('Error generating letter number:', error);
    throw new Error('Failed to generate letter number');
  }
};

/**
 * Assign letter number to an approved letter
 * 
 * @param {String} letterId - ID of the letter
 * @returns {Promise<Object>} Updated letter
 */
const assignLetterNumber = async (letterId) => {
  try {
    const letter = await Letter.findByPk(letterId);
    
    if (!letter) {
      throw new Error('Letter not found');
    }

    if (letter.status !== 'approved') {
      throw new Error('Only approved letters can be assigned a number');
    }

    if (letter.letterNumber) {
      throw new Error('Letter already has a number assigned');
    }

    const letterNumber = await generateLetterNumber(letter.letterType);
    
    await letter.update({ letterNumber });
    
    return letter;
  } catch (error) {
    console.error('Error assigning letter number:', error);
    throw error;
  }
};

/**
 * Cancel/remove letter number (supervisor only)
 * 
 * @param {String} letterId - ID of the letter
 * @returns {Promise<Object>} Updated letter
 */
const cancelLetterNumber = async (letterId) => {
  try {
    const letter = await Letter.findByPk(letterId);
    
    if (!letter) {
      throw new Error('Letter not found');
    }

    if (!letter.letterNumber) {
      throw new Error('Letter does not have a number assigned');
    }

    await letter.update({ letterNumber: null });
    
    return letter;
  } catch (error) {
    console.error('Error canceling letter number:', error);
    throw error;
  }
};

/**
 * Edit/reassign letter number (supervisor only)
 * 
 * @param {String} letterId - ID of the letter
 * @param {String} newLetterNumber - New letter number
 * @returns {Promise<Object>} Updated letter
 */
const editLetterNumber = async (letterId, newLetterNumber) => {
  try {
    const letter = await Letter.findByPk(letterId);
    
    if (!letter) {
      throw new Error('Letter not found');
    }

    // Check if the new number is already in use
    const existingLetter = await Letter.findOne({
      where: {
        letterNumber: newLetterNumber,
        id: {
          [Op.ne]: letterId,
        },
      },
    });

    if (existingLetter) {
      throw new Error('Letter number already in use');
    }

    await letter.update({ letterNumber: newLetterNumber });
    
    return letter;
  } catch (error) {
    console.error('Error editing letter number:', error);
    throw error;
  }
};

/**
 * Get statistics for letter numbering
 * 
 * @param {Number} year - Year to get statistics for
 * @returns {Promise<Object>} Statistics object
 */
const getLetterNumberingStats = async (year = new Date().getFullYear()) => {
  try {
    const letters = await Letter.findAll({
      where: {
        letterNumber: {
          [Op.like]: `${year}/%`,
        },
      },
      attributes: ['letterType', 'letterNumber'],
    });

    const stats = {};
    
    letters.forEach(letter => {
      if (!stats[letter.letterType]) {
        stats[letter.letterType] = {
          count: 0,
          lastNumber: null,
        };
      }
      
      stats[letter.letterType].count++;
      
      // Track the highest number
      const parts = letter.letterNumber.split('/');
      if (parts.length === 4) {
        const seq = parseInt(parts[3], 10);
        if (!stats[letter.letterType].lastNumber || seq > stats[letter.letterType].lastNumber) {
          stats[letter.letterType].lastNumber = seq;
        }
      }
    });

    return {
      year,
      totalLetters: letters.length,
      byType: stats,
    };
  } catch (error) {
    console.error('Error getting letter numbering stats:', error);
    throw error;
  }
};

module.exports = {
  generateLetterNumber,
  assignLetterNumber,
  cancelLetterNumber,
  editLetterNumber,
  getLetterNumberingStats,
};
