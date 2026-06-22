import { Injectable } from '@nestjs/common';

const PROFILE_FIELDS = [
  'profilePicture',
  'employeeId',
  'department',
  'phone',
  'address',
  'emergencyContact',
  'dateOfBirth',
] as const;

export type ProfileField = (typeof PROFILE_FIELDS)[number];

@Injectable()
export class ProfileService {
  calculateCompleteness(user: Record<string, unknown>): {
    percentage: number;
    completedFields: string[];
    missingFields: string[];
  } {
    const completedFields: string[] = [];
    const missingFields: string[] = [];

    for (const field of PROFILE_FIELDS) {
      const value = user[field];
      const isComplete =
        value !== null && value !== undefined && String(value).trim() !== '';

      if (isComplete) {
        completedFields.push(field);
      } else {
        missingFields.push(field);
      }
    }

    const percentage = Math.round(
      (completedFields.length / PROFILE_FIELDS.length) * 100,
    );

    return { percentage, completedFields, missingFields };
  }
}
