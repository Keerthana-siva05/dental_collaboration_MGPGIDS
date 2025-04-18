import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      enum: {
        values: ['pdf', 'video'],
        message: 'File type must be either pdf or video'
      }
    },
    courseType: {
      type: String,
      required: [true, 'Course type is required'],
      enum: {
        values: ['BDS', 'MDS'],
        message: 'Course type must be either BDS or MDS'
      },
      uppercase: true
    },
    academicYear: {
      type: Number,
      required: [true, 'Academic year is required'],
      min: [1, 'Academic year must be at least 1'],
      max: [4, 'Academic year cannot be more than 4']
    },
    filePath: {
      type: String,
      required: [true, 'File path is required']
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader information is required']
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    downloads: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for formatted year (1st, 2nd, etc.)
resourceSchema.virtual('formattedYear').get(function() {
  const suffixes = ['st', 'nd', 'rd', 'th'];
  const suffix = this.academicYear <= 3 ? suffixes[this.academicYear - 1] : 'th';
  return `${this.academicYear}${suffix} Year`;
});

// Virtual property for formatted file size
resourceSchema.virtual('formattedFileSize').get(function() {
  if (this.fileSize < 1024) return `${this.fileSize} bytes`;
  if (this.fileSize < 1024 * 1024) return `${(this.fileSize / 1024).toFixed(1)} KB`;
  return `${(this.fileSize / (1024 * 1024)).toFixed(1)} MB`;
});

// Indexes for better query performance
resourceSchema.index({ title: 'text', description: 'text' });
resourceSchema.index({ courseType: 1, academicYear: 1 });
resourceSchema.index({ createdAt: -1 });

// Pre-save hook to validate file type consistency
resourceSchema.pre('save', function(next) {
  if (this.fileType === 'video' && !this.filePath.match(/\.(mp4|webm|ogg)$/i)) {
    throw new Error('Video files must be MP4, WebM, or OGG format');
  }
  if (this.fileType === 'pdf' && !this.filePath.match(/\.(pdf|doc|docx|ppt|pptx)$/i)) {
    throw new Error('Document files must be PDF, DOC, DOCX, PPT, or PPTX format');
  }
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;