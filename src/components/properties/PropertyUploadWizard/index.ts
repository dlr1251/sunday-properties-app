// Main wizard component (for advanced use cases)
export { PropertyUploadWizard } from './PropertyUploadWizard';

// Unified modal wrapper (recommended for most use cases)
export { PropertyUploadWizardModal } from '../PropertyUploadWizardModal';

// Step components
export { Step1BasicInfo } from './Step1BasicInfo';
export { Step2PropertyDetails } from './Step2PropertyDetails';
export { Step3Images } from './Step3Images';
export { Step4Documents } from './Step4Documents';
export { Step5SellingConditions } from './Step5SellingConditions';
export { Step7FinalReview } from './Step7FinalReview';

// Re-export types
export type {
  PropertyData,
  Step1BasicInfoProps,
  Step2PropertyDetailsProps,
  Step3ImagesProps,
  Step4DocumentsProps,
  Step5SellingConditionsProps,
  Step7FinalReviewProps
} from './types';
