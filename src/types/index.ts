export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "volunteer" | "admin";
  status: "pending" | "approved" | "rejected";
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  education?: string;
  skills?: string[];
  interests?: string[];
  profileImage?: string;
  volunteerHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string | Date;
  time: string;
  venue: string;
  requiredVolunteers: number;
  bannerImage?: string;
  status: "open" | "closed";
  skillsRequired?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IApplication {
  _id: string;
  volunteerId: string | IUser;
  eventId: string | IEvent;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  hoursLogged: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICertificate {
  _id: string;
  volunteerId: string | IUser;
  eventId: string | IEvent;
  issueDate: string;
  verificationCode: string;
  createdAt?: string;
  updatedAt?: string;
}
