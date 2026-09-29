import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useNotifications } from '../../context/NotificationContext';
import { UtensilsCrossed, Star, Clock, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export function MessView() {
  const { addToast } = useNotifications();
  const [data, setData] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [loading, setLoading] = useState(true);

  // Feedback form
  const [mealType, setMealType] = useState('Lunch');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadMessData = async () => {
    try {
      const res = await apiFetch('/hostel/mess-menu');
      setData(res);

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[new Date().getDay()];
      setActiveDay(today);
    } catch (err) {
      console.error('Failed to load mess menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessData();
  }, []);

  const handleFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await apiFetch('/hostel/mess-feedback', {
        method: 'POST',
        body: { meal_type: mealType, rating: parseInt(rating, 10), comments }
      });
      addToast('success', res.message, 'Feedback Received');
      setComments('');
      loadMessData();
    } catch (err) {
      addToast('error', err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading mess operations...</div>;
  }

  const weeklyMenu = data?.weeklyMenu || {};
  const currentDayMeals = weeklyMenu[activeDay] || {};
  const feedbackStats = data?.feedbackStats || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Dining & Mess Operations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Weekly rotational meal menu, nutritional info, daily specials, and transparent student food ratings.
          </p>
        </div>

        {/* Day selector */}
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

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((mealName) => {
          const item = currentDayMeals[mealName] || {};
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
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.timing || 'Standard Timings'}</span>
                  </span>
                </div>

                <div className="my-3 text-xs text-slate-700 leading-relaxed font-medium">
                  {item.menu_items || 'Standard catering meal'}
                </div>

                {item.special_item && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Daily Special: <strong className="font-bold text-amber-950">{item.special_item}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.dietary_type || 'Veg / Non-Veg Options'}</span>
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Dietary Inspected</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ratings & Feedback Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Submit Food Quality Feedback</h3>
          <p className="text-xs text-slate-500 mb-4">Directly alerts mess supervisors and hostel administration.</p>

          <form onSubmit={handleFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Service</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Evening Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quality Rating (1 to 5 Stars)</label>
                <div className="flex items-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating}/5 Stars</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Quality Observations</label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Rice was well cooked, but vegetable dal was low on salt today..."
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Recording...' : 'Submit Food Feedback'}</span>
            </button>
          </form>
        </div>

        {/* Real-time Satisfaction Metric */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Student Satisfaction</h3>
            <p className="text-xs text-slate-500 mb-4">Aggregated from daily campus ratings.</p>

            <div className="space-y-3">
              {feedbackStats.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Ratings gathering active for current cycle.
                </div>
              ) : (
                feedbackStats.map((stat) => (
                  <div key={stat.meal_type} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                    <span className="font-medium text-slate-800">{stat.meal_type}</span>
                    <div className="flex items-center space-x-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{stat.avg_rating} / 5</span>
                      <span className="text-[10px] text-slate-400 font-normal">({stat.total_reviews})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Supervised by Hostel Food & Hygiene Committee
          </div>
        </div>
      </div>
    </div>
  );
}
