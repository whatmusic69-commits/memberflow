import countries from "@/config/countries.json";
import type { Locale } from "@/content";

export function CountrySelect({
  locale,
  label,
  placeholder,
  value,
  onChange,
}: {
  locale: Locale;
  label: string;
  placeholder: string;
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <label className="onboarding-field">
      <span>{label}</span>
      <select
        name="country"
        autoComplete="country"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {countries[locale].map((country) => (
          <option value={country.code} key={country.code}>
            {country.name} {country.flag}
          </option>
        ))}
      </select>
    </label>
  );
}
