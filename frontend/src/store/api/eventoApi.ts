import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app';

export const eventoApi = createApi({
  reducerPath: 'eventoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      // Try Redux store first, fall back to localStorage
      const token =
        (getState() as RootState).auth.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('evento_token') : null);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Booking', 'Client', 'Employee', 'Invoice', 'Quotation', 'Branding', 'Availability', 'InvoiceStats'],
  endpoints: (builder) => ({

    // ── Bookings / Events ─────────────────────────────────────────────────────
    getBookings: builder.query<any[], void>({
      query: () => '/events',
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation<any, any>({
      query: (body) => ({ url: '/events', method: 'POST', body }),
      invalidatesTags: ['Booking'],
    }),
    updateBooking: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/events/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Booking'],
    }),
    deleteBooking: builder.mutation<any, string>({
      query: (id) => ({ url: `/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Booking'],
    }),
    assignStaff: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/events/${id}/staff`, method: 'PUT', body }),
      invalidatesTags: ['Booking'],
    }),
    updateAssignment: builder.mutation<any, { assignmentId: string; status: string }>({
      query: ({ assignmentId, status }) => ({
        url: `/events/assignments/${assignmentId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Booking'],
    }),

    // ── Clients ───────────────────────────────────────────────────────────────
    getClients: builder.query<any[], void>({
      query: () => '/clients',
      providesTags: ['Client'],
    }),
    getClientById: builder.query<any, string>({
      query: (id) => `/clients/${id}`,
      providesTags: ['Client'],
    }),
    createClient: builder.mutation<any, any>({
      query: (body) => ({ url: '/clients', method: 'POST', body }),
      invalidatesTags: ['Client'],
    }),

    // ── Employees ─────────────────────────────────────────────────────────────
    getEmployees: builder.query<any[], void>({
      query: () => '/employees',
      providesTags: ['Employee'],
    }),
    createEmployee: builder.mutation<any, any>({
      query: (body) => ({ url: '/employees', method: 'POST', body }),
      invalidatesTags: ['Employee'],
    }),
    deleteEmployee: builder.mutation<any, string>({
      query: (id) => ({ url: `/employees/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Employee'],
    }),

    // ── Invoices ──────────────────────────────────────────────────────────────
    getInvoices: builder.query<any[], void>({
      query: () => '/invoices',
      providesTags: ['Invoice'],
    }),
    getInvoiceStats: builder.query<any, void>({
      query: () => '/invoices/stats',
      providesTags: ['InvoiceStats'],
    }),
    createInvoice: builder.mutation<any, any>({
      query: (body) => ({ url: '/invoices', method: 'POST', body }),
      invalidatesTags: ['Invoice', 'InvoiceStats'],
    }),
    recordPayment: builder.mutation<any, { invoiceId: string; body: any }>({
      query: ({ invoiceId, body }) => ({
        url: `/invoices/${invoiceId}/payments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invoice', 'InvoiceStats'],
    }),

    // ── Quotations ────────────────────────────────────────────────────────────
    getQuotations: builder.query<any[], void>({
      query: () => '/quotations',
      providesTags: ['Quotation'],
    }),
    createQuotation: builder.mutation<any, any>({
      query: (body) => ({ url: '/quotations', method: 'POST', body }),
      invalidatesTags: ['Quotation'],
    }),
    updateQuotationStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/quotations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Quotation'],
    }),

    // ── Branding ──────────────────────────────────────────────────────────────
    getBranding: builder.query<any, void>({
      query: () => '/company/branding',
      providesTags: ['Branding'],
    }),
    updateBranding: builder.mutation<any, any>({
      query: (body) => ({ url: '/company/branding', method: 'PUT', body }),
      invalidatesTags: ['Branding'],
    }),

    // ── Availability ──────────────────────────────────────────────────────────
    getAvailability: builder.query<any[], void>({
      query: () => '/availability',
      providesTags: ['Availability'],
    }),
    createAvailability: builder.mutation<any, any>({
      query: (body) => ({ url: '/availability', method: 'POST', body }),
      invalidatesTags: ['Availability'],
    }),
    deleteAvailability: builder.mutation<any, string>({
      query: (id) => ({ url: `/availability/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Availability'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useAssignStaffMutation,
  useUpdateAssignmentMutation,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetInvoicesQuery,
  useGetInvoiceStatsQuery,
  useCreateInvoiceMutation,
  useRecordPaymentMutation,
  useGetQuotationsQuery,
  useCreateQuotationMutation,
  useUpdateQuotationStatusMutation,
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useGetAvailabilityQuery,
  useCreateAvailabilityMutation,
  useDeleteAvailabilityMutation,
} = eventoApi;
