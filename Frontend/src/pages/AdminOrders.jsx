import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config.js";
import { useToast } from "../context/ToastContext";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function formatPrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : "$0.00";
}

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderIds, setUpdatingOrderIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || `Unable to load orders (${response.status}).`);
        }
        if (!Array.isArray(data.orders)) {
          throw new Error("Invalid orders response.");
        }

        if (active) {
          setOrders(
            [...data.orders].sort(
              (first, second) =>
                new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
            )
          );
        }
      } catch (requestError) {
        if (active) {
          const message = requestError.message || "Unable to load orders.";
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

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    accepted: orders.filter((order) => order.status === "accepted").length,
    declined: orders.filter((order) => order.status === "declined").length,
  }), [orders]);

  const visibleOrders = activeFilter === "all"
    ? orders
    : orders.filter((order) => order.status === activeFilter);

  const updateOrderStatus = async (order, status, declineReason) => {
    const orderId = order._id;
    setUpdatingOrderIds((current) => new Set(current).add(orderId));

    try {
      const body = { status };
      if (status === "declined" && declineReason) body.declineReason = declineReason;

      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Unable to update order (${response.status}).`);
      }
      if (!data.order) {
        throw new Error("The order update response did not include an order.");
      }

      setOrders((current) =>
        current.map((item) => (item._id === orderId ? data.order : item))
      );
      showToast(`Order ${status}.`);
    } catch (requestError) {
      showToast(requestError.message || "Unable to update order.", "error");
    } finally {
      setUpdatingOrderIds((current) => {
        const next = new Set(current);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleDecline = (order) => {
    const enteredReason = window.prompt("Optional decline reason:");
    if (enteredReason === null) return;

    const declineReason = enteredReason.trim();
    const confirmation = declineReason
      ? `Decline this order with the reason: "${declineReason}"?`
      : "Decline this order without a reason?";
    if (!window.confirm(confirmation)) return;

    updateOrderStatus(order, "declined", declineReason);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-leaf">Admin</p>
        <h1 className="font-display text-4xl font-bold">Orders</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter orders">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveFilter(value)}
            aria-pressed={activeFilter === value}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeFilter === value
                ? "bg-deep text-white"
                : "border border-sage/40 bg-white text-ink/70 hover:border-leaf hover:text-deep"
            }`}
          >
            {label} <span className="ml-1 opacity-75">{counts[value]}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-ink/60" role="status">Loading orders...</p>
      ) : error ? (
        <p className="py-16 text-center text-red-600">{error}</p>
      ) : visibleOrders.length === 0 ? (
        <p className="rounded-3xl border border-sage/30 bg-white px-6 py-16 text-center text-ink/60">
          No {activeFilter === "all" ? "" : `${activeFilter} `}orders found.
        </p>
      ) : (
        <div className="space-y-5">
          {visibleOrders.map((order) => {
            const status = String(order.status || "pending").toLowerCase();
            const badgeStyle = statusStyles[status] || statusStyles.pending;
            const isUpdating = updatingOrderIds.has(order._id);

            return (
              <article key={order._id} className="rounded-3xl border border-sage/30 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Order #{order._id}</p>
                    <p className="mt-1 text-sm text-ink/60">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyle}`}>
                    {status}
                  </span>
                </div>

                <div className="mt-5 grid gap-5 border-t border-sage/20 pt-5 sm:grid-cols-2">
                  <section>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Customer</h2>
                    <p className="font-medium">{order.user?.username || "Unknown customer"}</p>
                    <p className="break-all text-sm text-ink/60">{order.user?.email || "No email provided"}</p>
                  </section>
                  <section>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Shipping address</h2>
                    <p className="font-medium">{order.shippingAddress?.name || "—"}</p>
                    <p className="text-sm text-ink/70">
                      {order.shippingAddress?.address || "—"}
                      {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}
                    </p>
                    <p className="text-sm text-ink/60">{order.shippingAddress?.phone || "No phone provided"}</p>
                  </section>
                </div>

                <section className="mt-5 border-t border-sage/20 pt-4">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Items</h2>
                  <ul className="divide-y divide-sage/20">
                    {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                      <li key={`${item.name}-${index}`} className="flex justify-between gap-4 py-2 text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="shrink-0 text-ink/60">{formatPrice(Number(item.price) * Number(item.quantity))}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-sage/20 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-deep">{formatPrice(order.totalAmount)}</span>
                  </div>
                </section>

                {order.declineReason && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="font-semibold">Decline reason:</span> {order.declineReason}
                  </p>
                )}

                {status === "pending" && (
                  <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-sage/20 pt-4">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updateOrderStatus(order, "accepted")}
                      className="rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-deep disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleDecline(order)}
                      className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
