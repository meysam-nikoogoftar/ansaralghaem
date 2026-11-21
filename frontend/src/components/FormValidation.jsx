import ErrorSummary from './ErrorSummary'
import { ValidationContext } from '../utils/validationContext'
export default function FormValidation({ errors, children }) {
  return <ValidationContext.Provider value={errors}>
    <ErrorSummary errors={errors} />
    {children}
  </ValidationContext.Provider>
}
