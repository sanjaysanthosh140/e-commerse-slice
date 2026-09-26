# MegaMart

React frontend + Express/MongoDB backend.

## Run

```
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Backend: http://localhost:8080  
Frontend: http://localhost:5173

---

## Overselling

We do not reduce stock when you add to cart. Stock is only taken at checkout.

Checkout uses one MongoDB update that says: “only change stock if there is still enough left.” So if two people checkout the last unit at the same time, only one update works. The other gets an error (409). Stock never goes below zero.

If a cart has several items and one fails, we put back any stock we already took, then fail the whole checkout.

Code: `backend/src/user_side/stock.ts` and checkout in `cart_controller.ts`.

---

## Stale carts

When you open the cart, the server checks live stock again. If something sold out or has less left than your qty, the cart shows a warning and Checkout stays off until you remove it or lower the quantity.

At checkout we check again. If stock changed, you get a clear error (409) and nothing is charged.

Code: `GET /api/cart` and `POST /api/cart/checkout` in `cart_controller.ts`.
