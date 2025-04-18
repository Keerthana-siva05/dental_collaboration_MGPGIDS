import Faculty from '../models/Faculty.js';

export const getFacultyActivities = async (req, res) => {
  try {
    // Faculty is already attached to req by protectFaculty middleware
    const faculty = await Faculty.findById(req.faculty._id).select('name activities');
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.status(200).json({
      name: faculty.name,
      activities: faculty.activities || []
    });
  } catch (error) {
    console.error('Error fetching faculty activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFacultyActivities = async (req, res) => {
  try {
    const { activities } = req.body;
    
    if (!activities || !Array.isArray(activities)) {
      return res.status(400).json({ message: 'Activities array is required' });
    }

    const faculty = await Faculty.findByIdAndUpdate(
      req.faculty._id,
      { $set: { activities } },
      { new: true, select: 'name activities' }
    );
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    
    res.status(200).json({
      message: 'Activities updated successfully',
      name: faculty.name,
      activities: faculty.activities
    });
  } catch (error) {
    console.error('Error updating faculty activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPublicFacultyActivities = async (req, res) => {
  try {
    const faculty = await Faculty.find({ 
      activities: { $exists: true, $not: { $size: 0 } }
    })
    .select('name designation activities')
    .sort({ name: 1 }); // Sort alphabetically

    res.status(200).json(faculty);
  } catch (error) {
    console.error('Error fetching public faculty activities:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};