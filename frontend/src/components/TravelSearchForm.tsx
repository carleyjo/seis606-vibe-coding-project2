import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './TravelSearchForm.css';

export interface TravelSearchFormValues {
  destinationCity: string;
  startDate: string;
  endDate: string;
  adults: string;
  children: string;
  totalBudget: string;
  hasCar: 'yes' | 'no' | '';
}

export interface TravelSearchFormProps {
  onSubmit: (values: TravelSearchFormValues) => void;
}

type FormErrors = Partial<Record<keyof TravelSearchFormValues, string>>;

const initialValues: TravelSearchFormValues = {
  destinationCity: '',
  startDate: '',
  endDate: '',
  adults: '',
  children: '0',
  totalBudget: '',
  hasCar: '',
};

function TravelSearchForm({ onSubmit }: TravelSearchFormProps) {
  const [values, setValues] = useState<TravelSearchFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (errors[name as keyof TravelSearchFormValues]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }));
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const adults = Number(values.adults);
    const children = Number(values.children);
    const budget = Number(values.totalBudget);

    if (!values.destinationCity.trim()) {
      nextErrors.destinationCity = 'Enter a destination city.';
    }
    if (!values.startDate) {
      nextErrors.startDate = 'Select a start date.';
    }
    if (!values.endDate) {
      nextErrors.endDate = 'Select an end date.';
    } else if (values.startDate && values.endDate < values.startDate) {
      nextErrors.endDate = 'End date must be on or after the start date.';
    }
    if (!values.adults || !Number.isInteger(adults) || adults < 1) {
      nextErrors.adults = 'Enter at least 1 adult.';
    }
    if (!values.children || !Number.isInteger(children) || children < 0) {
      nextErrors.children = 'Enter 0 or more children.';
    }
    if (!values.totalBudget || !Number.isFinite(budget) || budget < 0) {
      nextErrors.totalBudget = 'Enter a non-negative budget.';
    }
    if (!values.hasCar) {
      nextErrors.hasCar = 'Select yes or no for car availability.';
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form className="travel-search-form" onSubmit={handleSubmit} noValidate>
      <div className="travel-search-form__grid">
        <div className="travel-search-form__field travel-search-form__field--wide">
          <label htmlFor="destinationCity">Destination City</label>
          <input
            id="destinationCity"
            name="destinationCity"
            type="text"
            value={values.destinationCity}
            onChange={handleChange}
            aria-invalid={Boolean(errors.destinationCity)}
            aria-describedby={errors.destinationCity ? 'destinationCity-error' : undefined}
          />
          {errors.destinationCity && <p className="travel-search-form__error" id="destinationCity-error">{errors.destinationCity}</p>}
        </div>

        <div className="travel-search-form__field">
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={values.startDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={errors.startDate ? 'startDate-error' : undefined}
          />
          {errors.startDate && <p className="travel-search-form__error" id="startDate-error">{errors.startDate}</p>}
        </div>

        <div className="travel-search-form__field">
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={values.endDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.endDate)}
            aria-describedby={errors.endDate ? 'endDate-error' : undefined}
          />
          {errors.endDate && <p className="travel-search-form__error" id="endDate-error">{errors.endDate}</p>}
        </div>

        <div className="travel-search-form__field">
          <label htmlFor="adults">Number of Adults</label>
          <input
            id="adults"
            name="adults"
            type="number"
            min="1"
            value={values.adults}
            onChange={handleChange}
            aria-invalid={Boolean(errors.adults)}
            aria-describedby={errors.adults ? 'adults-error' : undefined}
          />
          {errors.adults && <p className="travel-search-form__error" id="adults-error">{errors.adults}</p>}
        </div>

        <div className="travel-search-form__field">
          <label htmlFor="children">Number of Children</label>
          <input
            id="children"
            name="children"
            type="number"
            min="0"
            value={values.children}
            onChange={handleChange}
            aria-invalid={Boolean(errors.children)}
            aria-describedby={errors.children ? 'children-error' : undefined}
          />
          {errors.children && <p className="travel-search-form__error" id="children-error">{errors.children}</p>}
        </div>

        <div className="travel-search-form__field">
          <label htmlFor="totalBudget">Total Budget</label>
          <input
            id="totalBudget"
            name="totalBudget"
            type="number"
            min="0"
            step="0.01"
            value={values.totalBudget}
            onChange={handleChange}
            aria-invalid={Boolean(errors.totalBudget)}
            aria-describedby={errors.totalBudget ? 'totalBudget-error' : undefined}
          />
          {errors.totalBudget && <p className="travel-search-form__error" id="totalBudget-error">{errors.totalBudget}</p>}
        </div>
      </div>

      <fieldset className="travel-search-form__radio-group" aria-describedby={errors.hasCar ? 'hasCar-error' : undefined}>
        <legend>Car Availability</legend>
        <label>
          <input type="radio" name="hasCar" value="yes" checked={values.hasCar === 'yes'} onChange={handleChange} />
          Yes
        </label>
        <label>
          <input type="radio" name="hasCar" value="no" checked={values.hasCar === 'no'} onChange={handleChange} />
          No
        </label>
        {errors.hasCar && <p className="travel-search-form__error" id="hasCar-error">{errors.hasCar}</p>}
      </fieldset>

      <button className="travel-search-form__submit" type="submit">Find Attractions</button>
    </form>
  );
}

export default TravelSearchForm;
