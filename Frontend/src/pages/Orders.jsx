import { useEffect, useState } from "react";
import { API_URL } from "../config.js";
import { useToast } from "../context/ToastContext";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

export default function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/my`, {
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Unable to load your orders.");
        }
        if (!Array.isArray(data.orders)) {
          throw new Error("Invalid orders response.");
        }

        if (active) {
          setOrders(
            [...data.orders].sort(
              (first, second) =>
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime()
            )
          );
        }
      } catch (requestError) {
        if (active) {
          const message = requestError.message || "Unable to load your orders.";
          setError(message);
          showToast(message, "error");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [showToast]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold mb-8">My Orders</h1>

      {isLoading ? (
        <p className="text-center py-16 text-ink/60" role="status">
          Loading your orders...
        </p>
      ) : error ? (
        <p className="text-center py-16 text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-16 text-ink/60">You have no orders yet.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const status = String(order.status || "pending").toLowerCase();
            const badgeStyle = statusStyles[status] || statusStyles.pending;

            return (
              <article
                key={order._id}
                className="bg-white rounded-3xl border border-sage/30 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Order #{order._id}</p>
                    <p className="text-sm text-ink/60 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyle}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="divide-y divide-sage/20 mt-5">
                  {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                    <div
                      key={`${item.product || item.name}-${index}`}
                      className="flex flex-wrap justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-ink/60">
                          Quantity: {item.quantity} · ${Number(item.price).toFixed(2)} each
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {order.declineReason && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="font-semibold">Decline reason:</span>{" "}
                    {order.declineReason}
                  </p>
                )}

                <div className="flex justify-between border-t border-sage/30 mt-4 pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-deep">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
