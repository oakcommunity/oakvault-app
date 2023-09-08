import * as Yup from 'yup'

export const validationSchema = Yup.object({
  amount: Yup.number()
    .max(100, 'Amount cannot be more than 100')
    .positive('Amount must be positive')
    .test(
      'decimal-places',
      'Amount cannot have more than 6 decimal places',
      (value) => {
        if (!value) return true
        const decimalPlaces = value.toString().split('.')[1]?.length || 0
        return decimalPlaces <= 6
      },
    ),
})
