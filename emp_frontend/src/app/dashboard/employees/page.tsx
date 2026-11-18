"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/features/employees/employee.api";
import type { Employee, EmployeeSortField, SortOrder } from "@/types/employee";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 75, 100, -1];

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
];

const COLUMNS: { label: string; field: EmployeeSortField }[] = [
  { label: "Name", field: "name" },
  { label: "Email", field: "email" },
  { label: "Department", field: "department" },
  { label: "Salary", field: "salary" },
];

// Shared field styles. Explicit bg + text colors keep typed text visible
// regardless of the OS / browser dark-mode setting.
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm outline-none transition " +
  "focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 [color-scheme:light]";

const selectClass = `${fieldClass} pr-8`;

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function EmployeesPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [sortBy, setSortBy] = useState<EmployeeSortField>("createdAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );

  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createError, setCreateError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [salary, setSalary] = useState("");

  // Debounce search input before sending it to the API.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Reset pagination when filters or sorting change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, sortBy, order, limit]);

  const { data, isLoading, isFetching, isError, error } = useGetEmployeesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    department: department || undefined,
    sortBy,
    sortOrder: order,
  });

  const employees = data?.data ?? [];
  const pagination = data?.pagination;

  const apiError = error as
    | {
        status?: number | string;
        data?: { message?: string };
      }
    | undefined;

  useEffect(() => {
    if (apiError?.status === 401) {
      router.replace("/");
    }
  }, [apiError?.status, router]);

  // Auto-dismiss the success banner.
  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(id);
  }, [successMessage]);

  // Click a header: same column toggles asc/desc, a new column starts at asc.
  function handleSort(field: EmployeeSortField) {
    if (sortBy === field) {
      setOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  }

  function handleClearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setDepartment("");
  }

  function resetFormFields() {
    setName("");
    setEmail("");
    setDepartmentInput("");
    setSalary("");
  }

  function handleAddClick() {
    setSelectedEmployee(null);
    resetFormFields();
    setCreateError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function handleEditEmployee(employee: Employee) {
    setSelectedEmployee(employee);

    // Populate the form with existing employee details
    setName(employee.name);
    setEmail(employee.email);
    setDepartmentInput(employee.department);
    setSalary(String(employee.salary));

    setCreateError("");
    setSuccessMessage("");
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setSelectedEmployee(null);
    setCreateError("");
  }

  async function handleSubmitEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateError("");
    setSuccessMessage("");

    const employeeData = {
      name: name.trim(),
      email: email.trim(),
      department: departmentInput.trim(),
      salary: Number(salary),
    };

    try {
      if (selectedEmployee) {
        await updateEmployee({
          id: selectedEmployee._id,
          data: employeeData,
        }).unwrap();

        setSuccessMessage("Employee updated successfully.");
      } else {
        await createEmployee(employeeData).unwrap();

        setSuccessMessage("Employee created successfully.");
      }

      resetFormFields();
      setSelectedEmployee(null);
      setShowForm(false);
    } catch (err) {
      const submitError = err as {
        data?: { message?: string };
        status?: number | string;
      };

      if (submitError.status === 409) {
        setCreateError("An employee with this email already exists.");
      } else if (submitError.status === 401) {
        router.replace("/");
      } else if (submitError.status === 403) {
        setCreateError("You do not have permission to perform this action.");
      } else {
        setCreateError(submitError.data?.message ?? "Unable to save employee.");
      }
    }
  }

  async function handleConfirmDelete() {
    if (!employeeToDelete) return;

    setDeleteError("");

    try {
      await deleteEmployee(employeeToDelete._id).unwrap();

      // If the last row on this page was removed, step back one page.
      if (employees.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      }

      setSuccessMessage(`${employeeToDelete.name} was deleted.`);
      setEmployeeToDelete(null);
    } catch (err) {
      const delError = err as {
        data?: { message?: string };
        status?: number | string;
      };

      if (delError.status === 401) {
        router.replace("/");
      } else if (delError.status === 403) {
        setDeleteError("You do not have permission to delete employees.");
      } else {
        setDeleteError(delError.data?.message ?? "Unable to delete employee.");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading employees...
      </div>
    );
  }

  if (isError) {
    if (apiError?.status === 401) {
      return <p className="text-slate-600">Redirecting to login...</p>;
    }

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {apiError?.data?.message ?? "Unable to load employees."}
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <section>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your organization&apos;s employees.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add employee
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedEmployee ? "Edit employee" : "Add new employee"}
            </h2>

            <button
              type="button"
              onClick={handleCloseForm}
              aria-label="Close form"
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {createError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {createError}
            </div>
          )}

          <form
            onSubmit={handleSubmitEmployee}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label htmlFor="emp-name" className={labelClass}>
                Full name
              </label>
              <input
                id="emp-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                placeholder="Enter employee name"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="emp-email" className={labelClass}>
                Email address
              </label>
              <input
                id="emp-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                placeholder="employee@example.com"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="emp-department" className={labelClass}>
                Department
              </label>
              <input
                id="emp-department"
                type="text"
                list="department-options"
                value={departmentInput}
                onChange={(event) => setDepartmentInput(event.target.value)}
                required
                maxLength={100}
                placeholder="e.g. Engineering"
                className={fieldClass}
              />
              <datalist id="department-options">
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="emp-salary" className={labelClass}>
                Annual salary (₹)
              </label>
              <input
                id="emp-salary"
                type="number"
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="Enter salary"
                className={fieldClass}
              />
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-5 md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCreating
                  ? "Creating..."
                  : isUpdating
                    ? "Saving..."
                    : selectedEmployee
                      ? "Save changes"
                      : "Create employee"}
              </button>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email..."
            aria-label="Search employees"
            className={`${fieldClass} pl-9`}
          />
        </div>

        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          aria-label="Filter by department"
          className={selectClass}
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {(search || department) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {COLUMNS.map(({ label, field }) => {
                const isActive = sortBy === field;

                return (
                  <th
                    key={field}
                    scope="col"
                    aria-sort={
                      isActive
                        ? order === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(field)}
                      className={`inline-flex items-center gap-1.5 transition hover:text-slate-900 ${
                        isActive ? "text-slate-900" : ""
                      }`}
                    >
                      {label}
                      <span className="flex flex-col -space-y-1">
                        <ChevronUp
                          className={`h-3.5 w-3.5 ${
                            isActive && order === "asc"
                              ? "text-slate-900"
                              : "text-slate-300"
                          }`}
                        />
                        <ChevronDown
                          className={`h-3.5 w-3.5 ${
                            isActive && order === "desc"
                              ? "text-slate-900"
                              : "text-slate-300"
                          }`}
                        />
                      </span>
                    </button>
                  </th>
                );
              })}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold text-slate-500"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee._id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                  {employee.name}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {employee.email}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {employee.department}
                  </span>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm tabular-nums text-slate-600">
                  {employee.salary.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditEmployee(employee)}
                      aria-label={`Edit ${employee.name}`}
                      title="Edit"
                      className="rounded-md p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setEmployeeToDelete(employee);
                      }}
                      aria-label={`Delete ${employee.name}`}
                      title="Delete"
                      className="rounded-md p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No employees found. Try a different search or add a new
                  employee.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <label htmlFor="page-size">Entries per page:</label>

          <select
            id="page-size"
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-900 [color-scheme:light]"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size === -1 ? "All" : size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            {pagination
              ? `Page ${pagination.page} of ${pagination.totalPages} · ${pagination.total} employees`
              : "No employee data"}
          </span>

          <button
            type="button"
            disabled={page <= 1 || isFetching || limit === -1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              !pagination ||
              page >= pagination.totalPages ||
              isFetching ||
              limit === -1
            }
            onClick={() => setPage((currentPage) => currentPage + 1)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {isFetching && (
        <p className="mt-2 text-xs text-slate-500">Updating employee list...</p>
      )}

      {/* Delete confirmation dialog */}
      {employeeToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-100 p-2.5 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3
                  id="delete-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Delete employee?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">
                    {employeeToDelete.name}
                  </span>{" "}
                  will be permanently removed. This can&apos;t be undone.
                </p>

                {deleteError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700"
                  >
                    {deleteError}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}