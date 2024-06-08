DROP TABLE IF EXISTS post;

DROP TABLE IF EXISTS user;

DROP TABLE IF EXISTS comment;

DROP TABLE IF EXISTS category;

DROP TABLE IF EXISTS post_category;

DROP TABLE IF EXISTS reactions_post;

DROP TABLE IF EXISTS reactions_comment;

DROP TABLE IF EXISTS session;

DROP TABLE IF EXISTS message;

-- New table for private messages
-- Table user
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY,
  username TEXT,
  email TEXT,
  Age INTEGER,
  password TEXT,
  gender TEXT,
  firstname TEXT,
  lastname TEXT
);

-- Table post
CREATE TABLE IF NOT EXISTS post (
  id INTEGER PRIMARY KEY,
  title TEXT,
  body TEXT,
  user_id INTEGER,
  created_at TIMESTAMP,
  haveImages INTEGER,
  FOREIGN KEY (user_id) REFERENCES user (id)
);

-- Table reactions_post
CREATE TABLE IF NOT EXISTS reactions_post (
  id INTEGER PRIMARY KEY,
  reactions INTEGER,
  disreactions INTEGER,
  user_id INTEGER,
  post_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
);

-- Table reactions_comment
CREATE TABLE IF NOT EXISTS reactions_comment (
  id INTEGER PRIMARY KEY,
  reactions INTEGER,
  disreactions INTEGER,
  user_id INTEGER,
  comment_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (comment_id) REFERENCES comment (id)
);

-- Table comment
CREATE TABLE IF NOT EXISTS comment (
  id INTEGER PRIMARY KEY,
  body TEXT,
  created_at TIMESTAMP,
  user_id INTEGER,
  post_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
);

-- Table category
CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY, type TEXT);

-- Table post_category
CREATE TABLE IF NOT EXISTS post_category (
  category_post_id INTEGER PRIMARY KEY,
  category_id INTEGER,
  post_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES category (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
);

-- Table reactions_comment
CREATE TABLE IF NOT EXISTS reactions_comment (
  id INTEGER PRIMARY KEY,
  reactions INTEGER,
  disreactions INTEGER,
  user_id INTEGER,
  comment_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES user (id),
  FOREIGN KEY (comment_id) REFERENCES comment (id)
);

-- Table session
CREATE TABLE IF NOT EXISTS session (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT,
  user_id INT,
  date_de_creation DATETIME,
  date_limite DATETIME,
  FOREIGN KEY (user_id) REFERENCES user (id)
);

-- Table message for private messaging
CREATE TABLE IF NOT EXISTS message (
  id INTEGER PRIMARY KEY,
  content TEXT,
  room_id TEXT,
  username TEXT,
  sender_id TEXT,
  recipient_id TEXT,
  action TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);