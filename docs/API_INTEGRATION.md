# API Integration Guide

This document outlines how to integrate real API calls with the current mock data structure.

## Current State

All components currently use **mock data** stored in local state via `useState` and `useEffect`.

## Integration Points

### 1. MemberManagement

**Current:** Mock members array in `useEffect`
**Future:** API endpoint for members

```typescript
// Current (mock)
useEffect(() => {
  const mockMembers: Member[] = [...];
  setMembers(mockMembers);
}, []);

// Future (API)
const { data: members } = useQuery({
  queryKey: ['members'],
  queryFn: () => api.getMembers()
});
```

**API Endpoints Needed:**
- `GET /api/members` - List all members
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `POST /api/members/bulk` - Bulk upload

---

### 2. ClassBooking

**Current:** Mock classes and schedules
**Future:** API endpoints for classes

**API Endpoints Needed:**
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id/schedules` - Get schedules
- `POST /api/bookings` - Book class
- `GET /api/bookings` - List bookings

---

### 3. StaffManagement

**Current:** Mock staff array
**Future:** API endpoints for staff

**API Endpoints Needed:**
- `GET /api/staff` - List staff
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `GET /api/staff/:id/schedule` - Get schedule

---

### 4. PaymentSystem

**Current:** Mock payments and promo codes
**Future:** API endpoints for payments

**API Endpoints Needed:**
- `GET /api/payments` - List payments
- `POST /api/payments` - Process payment
- `GET /api/promo-codes` - List promo codes
- `POST /api/promo-codes` - Create promo code
- `GET /api/invoices` - List invoices

---

### 5. AnalyticsDashboard

**Current:** Mock analytics data
**Future:** API endpoint for analytics

**API Endpoints Needed:**
- `GET /api/analytics?period=30d` - Get analytics data
- Query params: `period` (7d, 30d, 90d, 1y)

---

## API Client Setup

The project already has:
- `@tanstack/react-query` installed
- `src/lib/api.ts` file (needs implementation)

### Implementation Steps

1. **Configure API Client** (`src/lib/api.ts`)
```typescript
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

2. **Update Components** to use React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Replace useState/useEffect with:
const { data, isLoading } = useQuery({
  queryKey: ['members'],
  queryFn: () => api.get('/members')
});
```

3. **Add Error Handling**
```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['members'],
  queryFn: () => api.get('/members'),
  onError: (error) => {
    toast.error('Failed to load members');
  }
});
```

## Data Structure Mapping

### Member API Response
```typescript
// API Response
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // ... matches Member type
}

// Component expects: Member[]
```

### Payment API Response
```typescript
// API Response
{
  id: string;
  memberId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  // ... matches Payment type
}

// Component expects: Payment[]
```

## Authentication Integration

**Current:** Mock authentication in AuthContext
**Future:** Real JWT authentication

```typescript
// Update AuthContext
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  setToken(response.data.token);
  setUser(response.data.user);
};
```

## Migration Checklist

- [ ] Set up API base URL
- [ ] Implement API client (`src/lib/api.ts`)
- [ ] Add authentication headers
- [ ] Replace mock data in MemberManagement
- [ ] Replace mock data in ClassBooking
- [ ] Replace mock data in StaffManagement
- [ ] Replace mock data in PaymentSystem
- [ ] Replace mock data in AnalyticsDashboard
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add optimistic updates
- [ ] Test all CRUD operations

## Best Practices

1. **Use React Query** for data fetching
2. **Type API responses** with TypeScript
3. **Handle loading states** with Skeleton components
4. **Show error messages** with Toast notifications
5. **Optimistic updates** for better UX
6. **Cache invalidation** after mutations

