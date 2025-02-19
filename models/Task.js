import mongoose from 'mongoose';

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
      default: 'medium',
    },
    dueDate: {
      type: Date,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reminderDate: { type: Date , required: false},
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
