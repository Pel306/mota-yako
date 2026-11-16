export interface TrackingEvent {
  type: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  origin: string;
  destination: string;
  weight?: string;
  events: TrackingEvent[];
}

export interface TrackingAPIResponse {
  success: boolean;
  data?: TrackingResult;
  error?: string;
}
