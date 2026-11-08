import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, MapPin, Tag, Hash } from "lucide-react";
import type { ServiceType } from "@clientfinder/shared";

const SearchFormSchema = z.object({
  location: z.string().max(100).optional(),
  keywords: z.string().max(300).optional(),
  maxResults: z.coerce.number().int().min(1).max(50).default(20),
});

type SearchFormData = z.infer<typeof SearchFormSchema>;

interface SearchFormProps {
  service: ServiceType | null;
  isLoading: boolean;
  onSubmit: (data: SearchFormData) => void;
}

export function SearchForm({ service, isLoading, onSubmit }: SearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: { maxResults: 20 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="label">
            <MapPin size={13} className="inline mr-1" />
            Location <span className="text-[var(--text-secondary)] font-normal">(optional)</span>
          </label>
          <input
            id="location"
            {...register("location")}
            placeholder="e.g. India, United States, London"
            className="input-field"
          />
          {errors.location && (
            <p className="text-xs text-brand-red mt-1">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="keywords" className="label">
            <Tag size={13} className="inline mr-1" />
            Keywords <span className="text-[var(--text-secondary)] font-normal">(optional)</span>
          </label>
          <input
            id="keywords"
            {...register("keywords")}
            placeholder="e.g. startup, e-commerce, agency"
            className="input-field"
          />
          {errors.keywords && (
            <p className="text-xs text-brand-red mt-1">{errors.keywords.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="w-40">
          <label htmlFor="maxResults" className="label">
            <Hash size={13} className="inline mr-1" />
            Max results
          </label>
          <input
            id="maxResults"
            type="number"
            {...register("maxResults")}
            min={1}
            max={50}
            className="input-field"
          />
          {errors.maxResults && (
            <p className="text-xs text-brand-red mt-1">{errors.maxResults.message}</p>
          )}
        </div>

        <button
          id="find-clients-btn"
          type="submit"
          disabled={!service || isLoading}
          className="btn-primary flex-1 justify-center py-2.5"
        >
          <Search size={16} />
          {isLoading ? "Searching…" : "Find Clients"}
        </button>
      </div>

      {!service && (
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Please select a service category above before searching.
        </p>
      )}
    </form>
  );
}
