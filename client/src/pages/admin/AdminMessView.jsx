import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { UtensilsCrossed, Edit3, Star, Clock, X, CheckCircle2 } from 'lucide-react';

export function AdminMessView() {
  const { addToast } = useNotifications();
  const [data, setData] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState('');
  const [specialItem, setSpecialItem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadData = async () => {
    try {
      const res = await apiFetch('/hostel/mess-menu');
      setData(res);
    } catch (err) {
      console.error('Failed to load mess data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEdit = (item) => {
    setEditingItem(item);
    setMenuItems(item.menu_items);
    setSpecialItem(item.special_item || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch(`/hostel/mess-menu/${editingItem.id}`, {
        method: 'PUT',
        body: {
          menu_items: menuItems,
          special_item: specialItem
        }
      });

      addToast('success', res.message, 'Menu Updated');
      setEditingItem(null);
      loadData();
    } catch (err) {
      addToast('error', err.message || 'Failed to update menu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading mess operations...</div>;
  }

  const weeklyMenu = data?.weeklyMenu || {};
  const currentMeals = weeklyMenu[activeDay] || {};
  const feedbackStats = data?.feedbackStats || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Mess & Catering Operations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Update weekly meal rosters, assign daily special menus, and review food hygiene satisfaction ratings.
          </p>
        </div>

        {/* Day of Week Selector */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                activeDay === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid for Active Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((mealName) => {
          const item = currentMeals[mealName] || {};
          return (
            <div
              key={mealName}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle hover:border-blue-200 hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <UtensilsCrossed className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{mealName}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{item.timing}</span>
                </div>

                <div className="my-3 text-xs text-slate-700 leading-relaxed">
                  {item.menu_items || 'Standard catering menu'}
                </div>

                {item.special_item && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-2">
                    Special Dish: <strong>{item.special_item}</strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.dietary_type}</span>
                <button
                  onClick={() => openEdit(item)}
                  className="px-3 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Menu</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Student Meal Quality Ratings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {feedbackStats.map((stat) => (
            <div key={stat.meal_type} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="font-bold text-xs text-slate-900 mb-1">{stat.meal_type}</div>
              <div className="flex items-center justify-center space-x-1 text-amber-600 font-black text-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{stat.avg_rating}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{stat.total_reviews} student reviews</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Edit {editingItem.day_of_week} {editingItem.meal_type}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Timing: {editingItem.timing}</p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Menu Items</label>
                <textarea
                  rows={3}
                  value={menuItems}
                  onChange={(e) => setMenuItems(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Special Dish</label>
                <input
                  type="text"
                  value={specialItem}
                  onChange={(e) => setSpecialItem(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala / Chicken Biryani"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-xs text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  {submitting ? 'Saving...' : 'Update Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
