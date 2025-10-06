const express = require('express');
const router = express.Router();
const {
  createLetter,
  getLetters,
  getLetterById,
  updateLetterStatus,
  deleteLetter,
} = require('../controllers/letterController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { getAllLetterTypes } = require('../config/letterTypes');

// Letter creation validation
const createLetterValidation = [
  body('letterType')
    .notEmpty()
    .withMessage('Letter type is required'),
  body('purpose')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Purpose must not exceed 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('additionalData')
    .optional()
    .isObject()
    .withMessage('Additional data must be an object'),
];

// Status update validation
const updateStatusValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('rejectionReason')
    .custom((value, { req }) => {
      if (req.body.status === 'rejected' && !value) {
        throw new Error('Rejection reason is required when rejecting a letter');
      }
      return true;
    }),
];

// Get all letter types (public for students to see available types)
router.get('/types', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      letterTypes: getAllLetterTypes(),
    },
  });
});

// Create letter (students only)
router.post('/', authenticate, authorize('student'), createLetterValidation, createLetter);

// Get all letters (filtered by role)
router.get('/', authenticate, getLetters);

// Get letter by ID
router.get('/:id', authenticate, getLetterById);

// Update letter status (admin and supervisor only)
router.put('/:id/status', authenticate, authorize('admin', 'supervisor'), updateStatusValidation, updateLetterStatus);

// Delete letter (students can delete their own pending letters)
router.delete('/:id', authenticate, deleteLetter);

module.exports = router;
