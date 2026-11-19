const ALLOWED_MODES = ['Remote', 'Hybrid', 'On-site'];

/**
 * Validates request body for creating or updating an internship.
 * @param {boolean} [isPartial=false] - True for PATCH (fields are optional), false for POST/PUT (all fields required)
 */
function validateInternship(isPartial = false) {
  return (req, res, next) => {
    const { id, title, domain, mode, location, skills, openings } = req.body;
    const errors = [];

    // If PATCH and no fields provided at all
    if (isPartial && Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields provided for update. Provide at least one field to update.',
        errors: [{ field: 'body', message: 'Request body cannot be empty' }]
      });
    }

    // ID validation (if provided)
    if (id !== undefined) {
      if (typeof id !== 'string' || id.trim().length === 0) {
        errors.push({ field: 'id', message: 'ID must be a non-empty string' });
      } else if (id.length > 50) {
        errors.push({ field: 'id', message: 'ID cannot exceed 50 characters' });
      }
    }

    // Title validation
    if (!isPartial || title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        errors.push({ field: 'title', message: 'Title is required and must be a non-empty string' });
      } else if (title.trim().length < 2 || title.trim().length > 120) {
        errors.push({ field: 'title', message: 'Title must be between 2 and 120 characters' });
      }
    }

    // Domain validation
    if (!isPartial || domain !== undefined) {
      if (typeof domain !== 'string' || domain.trim().length === 0) {
        errors.push({ field: 'domain', message: 'Domain is required and must be a non-empty string' });
      } else if (domain.trim().length < 2 || domain.trim().length > 80) {
        errors.push({ field: 'domain', message: 'Domain must be between 2 and 80 characters' });
      }
    }

    // Mode validation
    if (!isPartial || mode !== undefined) {
      if (!mode || typeof mode !== 'string') {
        errors.push({ field: 'mode', message: `Mode is required and must be one of: ${ALLOWED_MODES.join(', ')}` });
      } else {
        const normalizedMode = ALLOWED_MODES.find(m => m.toLowerCase() === mode.trim().toLowerCase());
        if (!normalizedMode) {
          errors.push({
            field: 'mode',
            message: `Mode must be one of: ${ALLOWED_MODES.join(', ')} (received '${mode}')`
          });
        } else {
          // Normalize case to canonical value
          req.body.mode = normalizedMode;
        }
      }
    }

    // Location validation
    if (!isPartial || location !== undefined) {
      if (typeof location !== 'string' || location.trim().length === 0) {
        errors.push({ field: 'location', message: 'Location is required and must be a non-empty string' });
      } else if (location.trim().length < 2 || location.trim().length > 80) {
        errors.push({ field: 'location', message: 'Location must be between 2 and 80 characters' });
      }
    }

    // Skills validation
    if (!isPartial || skills !== undefined) {
      if (!Array.isArray(skills)) {
        errors.push({ field: 'skills', message: 'Skills must be an array of strings' });
      } else if (skills.length === 0) {
        errors.push({ field: 'skills', message: 'Skills array must contain at least one skill' });
      } else {
        const invalidSkills = skills.filter(s => typeof s !== 'string' || s.trim().length === 0);
        if (invalidSkills.length > 0) {
          errors.push({ field: 'skills', message: 'All items in skills array must be non-empty strings' });
        }
      }
    }

    // Openings validation
    if (!isPartial || openings !== undefined) {
      const parsedOpenings = Number(openings);
      if (openings === undefined && !isPartial) {
        req.body.openings = 1;
      } else if (!Number.isInteger(parsedOpenings) || parsedOpenings < 0) {
        errors.push({ field: 'openings', message: 'Openings must be a non-negative integer (>= 0)' });
      } else {
        req.body.openings = parsedOpenings;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
}

module.exports = {
  validateInternship,
  ALLOWED_MODES
};
