import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchCompony = () => {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const keyword = search.trim();

    if (!keyword) {
      setCompanies([]);
      setError("");
      setLoading(false);
      setHasSearched(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${backendUrl}/api/companies/search`,
          { params: { keyword } }
        );

        if (cancelled) return;

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to search companies."
          );
        }

        setCompanies(
          Array.isArray(response.data.companies)
            ? response.data.companies
            : []
        );

        setHasSearched(true);
      } catch (err) {
        if (cancelled) return;

        setCompanies([]);
        setHasSearched(true);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to search companies."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, backendUrl]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      setCompanies([]);
      setHasSearched(false);
      setError("");
    }
  };

  return (
    <section
      data-aos="fade-left"
      className="mx-auto max-w-7xl px-5 py-12"
    >
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 rounded-2xl bg-slate-100 p-3 sm:p-5"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-w-0 border-none bg-transparent px-3 py-3 outline-none"
          type="search"
          placeholder="Search companies..."
          aria-label="Search companies"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-green-500 px-5 py-3 text-white shadow-lg transition hover:bg-green-600 disabled:opacity-60 sm:px-7"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && (
        <p className="mt-5 text-sm text-gray-500">
          Searching companies...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && hasSearched && companies.length === 0 && (
        <p className="mt-5 rounded-lg bg-gray-50 p-4 text-gray-500">
          No companies found. Try another name.
        </p>
      )}

      {!loading && companies.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <article
              key={company._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.companyName || company.name} logo`}
                    className="h-14 w-14 rounded-xl border border-gray-100 object-contain p-1"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-xl font-bold text-green-700">
                    {(company.companyName || company.name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="break-words font-bold text-gray-900">
                    {company.companyName || company.name}
                  </h2>

                  {company.location && (
                    <p className="mt-1 text-sm text-gray-500">
                      {company.location}
                    </p>
                  )}
                </div>
              </div>

              {company.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                  {company.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchCompony;
