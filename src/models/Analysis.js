import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
     userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
    },
    
    matchedKeywords: [String],

    missingKeywords: [String],

    suggestions: [String],
  },
  { timestamps: true }
);

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;