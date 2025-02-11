const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const proRoutes = require('./routes/proRoutes');
const categRoutes = require('./routes/categRoutes');
const variRoutes = require('./routes/variRoutes');

dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'image')));
app.use('/uploads', express.static('uploads'));

// API logger
app.use((req, res, next) => {
  console.log(`[${req.method} ${req.originalUrl}]`);
  next();   
});

//User API
app.use('/', authRoutes);

//Product API
app.use('/', proRoutes);

//Category API
app.use('/', categRoutes);

// variation API
app.use('/', variRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});