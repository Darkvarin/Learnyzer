-- Create missing wellness tables

CREATE TABLE IF NOT EXISTS wellness_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  break_reminder_enabled BOOLEAN DEFAULT true,
  break_interval_minutes INTEGER DEFAULT 60,
  break_types JSON DEFAULT '["eye_strain", "posture", "hydration", "movement", "breathing"]',
  notification_sound BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wellness_breaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  break_type VARCHAR(50) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wellness_preferences_user_id ON wellness_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_breaks_user_id ON wellness_breaks(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_breaks_completed_at ON wellness_breaks(completed_at);