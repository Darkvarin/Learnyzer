-- Create feedback categories table
CREATE TABLE IF NOT EXISTS feedback_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create customer feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES feedback_categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  rating INTEGER,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  user_email TEXT,
  user_name TEXT,
  tags TEXT,
  attachments TEXT,
  admin_response TEXT,
  admin_response_at TIMESTAMP,
  responded_by INTEGER REFERENCES users(id),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create feedback votes table
CREATE TABLE IF NOT EXISTS feedback_votes (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER REFERENCES customer_feedback(id) NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  vote_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create feedback comments table
CREATE TABLE IF NOT EXISTS feedback_comments (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER REFERENCES customer_feedback(id) NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  comment TEXT NOT NULL,
  is_admin_comment BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Insert feedback categories
INSERT INTO feedback_categories (name, description, icon, is_active) VALUES
('General Feedback', 'General feedback about the platform', 'MessageSquare', true),
('Feature Request', 'Suggestions for new features', 'Lightbulb', true),
('Bug Report', 'Report bugs and technical issues', 'Bug', true),
('AI Tutor', 'Feedback about AI tutoring experience', 'Brain', true),
('Course Content', 'Feedback about course materials and content', 'BookOpen', true),
('User Experience', 'Feedback about website usability and design', 'Palette', true),
('Performance', 'Website speed and performance issues', 'Zap', true)
ON CONFLICT (name) DO NOTHING;