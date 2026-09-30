CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  username varchar(30) UNIQUE NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name varchar(80) NOT NULL,
  bio varchar(500),
  avatar_url text,
  cover_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reactions (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type varchar(20) NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(post_id,user_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(requester_id,addressee_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(conversation_id,user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text,
  media_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(40) NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(blocker_id,blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reason varchar(100) NOT NULL,
  details text,
  status varchar(30) NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_created_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id,created_at);
