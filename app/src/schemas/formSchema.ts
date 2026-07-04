import * as yup from 'yup';
import { RIDE_ROLE } from '../constants/enums';

export const rideFormSchema = yup.object().shape({
  from: yup.string().required('From location is required*'),
  to: yup.string().required('To location is required*'),
  message: yup.string().required('Message is required*'),
  role: yup
    .string()
    .oneOf(Object.values(RIDE_ROLE))
    .required('Role is required*'),
});
