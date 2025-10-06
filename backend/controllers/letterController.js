const { Letter, User } = require('../models');
const { validationResult } = require('express-validator');
const { isValidLetterType, getLetterTypeByCode } = require('../config/letterTypes');
const { assignLetterNumber, cancelLetterNumber, editLetterNumber, getLetterNumberingStats } = require('../utils/letterNumbering');

/**
 * Create a new letter request
 * POST /api/letters
 */
const createLetter = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { letterType, additionalData, purpose, notes } = req.body;

    // Validate letter type
    if (!isValidLetterType(letterType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid letter type',
      });
    }

    // Get letter type info
    const letterTypeInfo = getLetterTypeByCode(letterType);

    // Validate required fields
    if (letterTypeInfo.requiredFields && letterTypeInfo.requiredFields.length > 0) {
      const missingFields = letterTypeInfo.requiredFields.filter(
        field => !additionalData || !additionalData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          missingFields,
        });
      }
    }

    // Create letter
    const letter = await Letter.create({
      letterType,
      userId: req.user.id,
      additionalData,
      purpose,
      notes,
      status: 'pending',
    });

    // Fetch letter with user info
    const letterWithUser = await Letter.findByPk(letter.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'nim', 'role'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Letter request created successfully',
      data: {
        letter: letterWithUser,
        letterTypeInfo,
      },
    });
  } catch (error) {
    console.error('Create letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating letter request',
      error: error.message,
    });
  }
};

/**
 * Get all letters (with filtering)
 * GET /api/letters
 */
const getLetters = async (req, res) => {
  try {
    const { status, letterType, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    const where = {};
    
    // If user is student, only show their letters
    if (req.user.role === 'student') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (letterType) {
      where.letterType = letterType;
    }

    // Get letters with pagination
    const { count, rows: letters } = await Letter.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'nim', 'role'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
        {
          model: User,
          as: 'rejector',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: {
        letters,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get letters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching letters',
      error: error.message,
    });
  }
};

/**
 * Get letter by ID
 * GET /api/letters/:id
 */
const getLetterById = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'nim', 'nip', 'role'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
        {
          model: User,
          as: 'rejector',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
      ],
    });

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    // Check authorization
    if (req.user.role === 'student' && letter.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own letters',
      });
    }

    const letterTypeInfo = getLetterTypeByCode(letter.letterType);

    res.status(200).json({
      success: true,
      data: {
        letter,
        letterTypeInfo,
      },
    });
  } catch (error) {
    console.error('Get letter by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching letter',
      error: error.message,
    });
  }
};

/**
 * Update letter status (approve/reject)
 * PUT /api/letters/:id/status
 */
const updateLetterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    const letter = await Letter.findByPk(id);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    // Check if letter is still pending
    if (letter.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Letter is already ${letter.status}`,
      });
    }

    // Update letter
    const updateData = { status };

    if (status === 'approved') {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedBy = req.user.id;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = rejectionReason;
    }

    await letter.update(updateData);

    // Auto-assign letter number when approved
    if (status === 'approved') {
      try {
        await assignLetterNumber(id);
      } catch (error) {
        console.error('Error auto-assigning letter number:', error);
        // Continue even if numbering fails
      }
    }

    // Fetch updated letter with associations
    const updatedLetter = await Letter.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'nim'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
        {
          model: User,
          as: 'rejector',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Letter ${status} successfully`,
      data: {
        letter: updatedLetter,
      },
    });
  } catch (error) {
    console.error('Update letter status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating letter status',
      error: error.message,
    });
  }
};

/**
 * Delete letter (only pending letters by owner)
 * DELETE /api/letters/:id
 */
const deleteLetter = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await Letter.findByPk(id);

    if (!letter) {
      return res.status(404).json({
        success: false,
        message: 'Letter not found',
      });
    }

    // Check authorization
    if (req.user.role === 'student' && letter.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own letters',
      });
    }

    // Only allow deletion of pending letters
    if (letter.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending letters can be deleted',
      });
    }

    await letter.destroy();

    res.status(200).json({
      success: true,
      message: 'Letter deleted successfully',
    });
  } catch (error) {
    console.error('Delete letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting letter',
      error: error.message,
    });
  }
};

module.exports = {
  createLetter,
  getLetters,
  getLetterById,
  updateLetterStatus,
  deleteLetter,
};

/**
 * Manually cancel letter number (supervisor only)
 * PUT /api/letters/:id/number/cancel
 */
const cancelNumber = async (req, res) => {
  try {
    const { id } = req.params;

    const letter = await cancelLetterNumber(id);

    res.status(200).json({
      success: true,
      message: 'Letter number canceled successfully',
      data: { letter },
    });
  } catch (error) {
    console.error('Cancel letter number error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error canceling letter number',
    });
  }
};

/**
 * Manually edit letter number (supervisor only)
 * PUT /api/letters/:id/number/edit
 */
const editNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { letterNumber } = req.body;

    if (!letterNumber) {
      return res.status(400).json({
        success: false,
        message: 'Letter number is required',
      });
    }

    const letter = await editLetterNumber(id, letterNumber);

    res.status(200).json({
      success: true,
      message: 'Letter number updated successfully',
      data: { letter },
    });
  } catch (error) {
    console.error('Edit letter number error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error editing letter number',
    });
  }
};

/**
 * Get letter numbering statistics
 * GET /api/letters/stats/numbering
 */
const getNumberingStats = async (req, res) => {
  try {
    const { year } = req.query;
    const stats = await getLetterNumberingStats(year ? parseInt(year) : undefined);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get numbering stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching numbering statistics',
      error: error.message,
    });
  }
};

module.exports = {
  createLetter,
  getLetters,
  getLetterById,
  updateLetterStatus,
  deleteLetter,
  cancelNumber,
  editNumber,
  getNumberingStats,
};
