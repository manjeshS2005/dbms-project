const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Manjesh@123',
    database: 'film_festival'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + db.threadId);
});

// Utility function for database queries
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Routes

// Get dashboard stats
app.get('/api/dashboard', async (req, res) => {
    try {
        const [movies, directors, festivals, awards] = await Promise.all([
            query('SELECT COUNT(*) as count FROM Movie'),
            query('SELECT COUNT(*) as count FROM Director'),
            query('SELECT COUNT(*) as count FROM Festival'),
            query('SELECT COUNT(*) as count FROM Award')
        ]);

        res.json({
            movies: movies[0].count,
            directors: directors[0].count,
            festivals: festivals[0].count,
            awards: awards[0].count
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get all data for dashboard
app.get('/api/dashboard/data', async (req, res) => {
    try {
        const moviesQuery = `
            SELECT m.*, d.Director_Name, f.Festival_Name 
            FROM Movie m 
            LEFT JOIN Director d ON m.Director_ID = d.Director_ID 
            LEFT JOIN Festival f ON m.Festival_ID = f.Festival_ID 
            ORDER BY m.Movie_ID DESC 
            LIMIT 10
        `;

        const [movies, directors, festivals, actors, awards] = await Promise.all([
            query(moviesQuery),
            query('SELECT * FROM Director ORDER BY Director_Name'),
            query('SELECT * FROM Festival ORDER BY Festival_Name'),
            query('SELECT * FROM Actor ORDER BY Actor_Name'),
            query(`
                SELECT a.*, m.Title as Movie_Title, f.Festival_Name 
                FROM Award a 
                LEFT JOIN Movie m ON a.Movie_ID = m.Movie_ID 
                LEFT JOIN Festival f ON m.Festival_ID = f.Festival_ID
                ORDER BY a.Award_Name
            `)
        ]);

        res.json({
            movies: movies,
            directors: directors,
            festivals: festivals,
            actors: actors,
            awards: awards
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Directors routes
app.get('/api/directors', async (req, res) => {
    try {
        const directors = await query('SELECT * FROM Director ORDER BY Director_Name');
        res.json(directors);
    } catch (error) {
        console.error('Directors fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch directors' });
    }
});

app.post('/api/directors', async (req, res) => {
    try {
        const { Director_Name, Nationality } = req.body;
        
        if (!Director_Name) {
            return res.status(400).json({ error: 'Director name is required' });
        }
        
        const result = await query(
            'INSERT INTO Director (Director_Name, Nationality) VALUES (?, ?)',
            [Director_Name, Nationality]
        );
        
        res.status(201).json({
            Director_ID: result.insertId,
            Director_Name,
            Nationality
        });
    } catch (error) {
        console.error('Director create error:', error);
        res.status(500).json({ error: 'Failed to add director' });
    }
});

app.put('/api/directors/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { Director_Name, Nationality } = req.body;
        
        if (!Director_Name) {
            return res.status(400).json({ error: 'Director name is required' });
        }
        
        await query(
            'UPDATE Director SET Director_Name = ?, Nationality = ? WHERE Director_ID = ?',
            [Director_Name, Nationality, id]
        );
        
        res.json({ 
            message: 'Director updated successfully',
            Director_ID: parseInt(id),
            Director_Name,
            Nationality
        });
    } catch (error) {
        console.error('Director update error:', error);
        res.status(500).json({ error: 'Failed to update director' });
    }
});

app.delete('/api/directors/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Check if director is referenced in movies
        const movieCount = await query('SELECT COUNT(*) as count FROM Movie WHERE Director_ID = ?', [id]);
        
        if (movieCount[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete director. There are movies associated with this director.' 
            });
        }
        
        await query('DELETE FROM Director WHERE Director_ID = ?', [id]);
        res.json({ message: 'Director deleted successfully' });
    } catch (error) {
        console.error('Director delete error:', error);
        res.status(500).json({ error: 'Failed to delete director' });
    }
});

// Festivals routes
app.get('/api/festivals', async (req, res) => {
    try {
        const festivals = await query('SELECT * FROM Festival ORDER BY Festival_Name');
        res.json(festivals);
    } catch (error) {
        console.error('Festivals fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch festivals' });
    }
});

app.post('/api/festivals', async (req, res) => {
    try {
        const { Festival_Name, Location, Start_Date, End_Date } = req.body;
        
        if (!Festival_Name) {
            return res.status(400).json({ error: 'Festival name is required' });
        }
        
        const result = await query(
            'INSERT INTO Festival (Festival_Name, Location, Start_Date, End_Date) VALUES (?, ?, ?, ?)',
            [Festival_Name, Location, Start_Date, End_Date]
        );
        
        res.status(201).json({
            Festival_ID: result.insertId,
            Festival_Name,
            Location,
            Start_Date,
            End_Date
        });
    } catch (error) {
        console.error('Festival create error:', error);
        res.status(500).json({ error: 'Failed to add festival' });
    }
});

app.put('/api/festivals/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { Festival_Name, Location, Start_Date, End_Date } = req.body;
        
        if (!Festival_Name) {
            return res.status(400).json({ error: 'Festival name is required' });
        }
        
        await query(
            'UPDATE Festival SET Festival_Name = ?, Location = ?, Start_Date = ?, End_Date = ? WHERE Festival_ID = ?',
            [Festival_Name, Location, Start_Date, End_Date, id]
        );
        
        res.json({ 
            message: 'Festival updated successfully',
            Festival_ID: parseInt(id),
            Festival_Name,
            Location,
            Start_Date,
            End_Date
        });
    } catch (error) {
        console.error('Festival update error:', error);
        res.status(500).json({ error: 'Failed to update festival' });
    }
});

app.delete('/api/festivals/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Check if festival is referenced in movies
        const movieCount = await query('SELECT COUNT(*) as count FROM Movie WHERE Festival_ID = ?', [id]);
        
        if (movieCount[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete festival. There are movies associated with this festival.' 
            });
        }
        
        await query('DELETE FROM Festival WHERE Festival_ID = ?', [id]);
        res.json({ message: 'Festival deleted successfully' });
    } catch (error) {
        console.error('Festival delete error:', error);
        res.status(500).json({ error: 'Failed to delete festival' });
    }
});

// Movies routes
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await query(`
            SELECT m.*, d.Director_Name, f.Festival_Name 
            FROM Movie m 
            LEFT JOIN Director d ON m.Director_ID = d.Director_ID 
            LEFT JOIN Festival f ON m.Festival_ID = f.Festival_ID 
            ORDER BY m.Title
        `);
        res.json(movies);
    } catch (error) {
        console.error('Movies fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

app.post('/api/movies', async (req, res) => {
    try {
        const { Title, Genre, Release_Year, Director_ID, Festival_ID } = req.body;
        
        console.log('Received movie data:', req.body);
        
        if (!Title) {
            return res.status(400).json({ error: 'Movie title is required' });
        }
        
        const result = await query(
            'INSERT INTO Movie (Title, Genre, Release_Year, Director_ID, Festival_ID) VALUES (?, ?, ?, ?, ?)',
            [Title, Genre, Release_Year, Director_ID || null, Festival_ID || null]
        );
        
        console.log('Movie inserted with ID:', result.insertId);
        
        res.status(201).json({
            Movie_ID: result.insertId,
            Title,
            Genre,
            Release_Year,
            Director_ID,
            Festival_ID
        });
    } catch (error) {
        console.error('Movie create error:', error);
        res.status(500).json({ error: 'Failed to add movie: ' + error.message });
    }
});

app.put('/api/movies/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { Title, Genre, Release_Year, Director_ID, Festival_ID } = req.body;
        
        console.log('Updating movie:', id, req.body);
        
        if (!Title) {
            return res.status(400).json({ error: 'Movie title is required' });
        }
        
        await query(
            'UPDATE Movie SET Title = ?, Genre = ?, Release_Year = ?, Director_ID = ?, Festival_ID = ? WHERE Movie_ID = ?',
            [Title, Genre, Release_Year, Director_ID || null, Festival_ID || null, id]
        );
        
        res.json({ 
            message: 'Movie updated successfully',
            Movie_ID: parseInt(id),
            Title,
            Genre,
            Release_Year,
            Director_ID,
            Festival_ID
        });
    } catch (error) {
        console.error('Movie update error:', error);
        res.status(500).json({ error: 'Failed to update movie: ' + error.message });
    }
});

app.delete('/api/movies/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Check if movie is referenced in awards
        const awardCount = await query('SELECT COUNT(*) as count FROM Award WHERE Movie_ID = ?', [id]);
        
        if (awardCount[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete movie. There are awards associated with this movie.' 
            });
        }
        
        await query('DELETE FROM Movie WHERE Movie_ID = ?', [id]);
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error('Movie delete error:', error);
        res.status(500).json({ error: 'Failed to delete movie' });
    }
});

// Actors routes
app.get('/api/actors', async (req, res) => {
    try {
        const actors = await query('SELECT * FROM Actor ORDER BY Actor_Name');
        res.json(actors);
    } catch (error) {
        console.error('Actors fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch actors' });
    }
});

app.post('/api/actors', async (req, res) => {
    try {
        const { Actor_Name, Gender, Nationality } = req.body;
        
        if (!Actor_Name) {
            return res.status(400).json({ error: 'Actor name is required' });
        }
        
        const result = await query(
            'INSERT INTO Actor (Actor_Name, Gender, Nationality) VALUES (?, ?, ?)',
            [Actor_Name, Gender, Nationality]
        );
        
        res.status(201).json({
            Actor_ID: result.insertId,
            Actor_Name,
            Gender,
            Nationality
        });
    } catch (error) {
        console.error('Actor create error:', error);
        res.status(500).json({ error: 'Failed to add actor' });
    }
});

app.put('/api/actors/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { Actor_Name, Gender, Nationality } = req.body;
        
        if (!Actor_Name) {
            return res.status(400).json({ error: 'Actor name is required' });
        }
        
        await query(
            'UPDATE Actor SET Actor_Name = ?, Gender = ?, Nationality = ? WHERE Actor_ID = ?',
            [Actor_Name, Gender, Nationality, id]
        );
        
        res.json({ 
            message: 'Actor updated successfully',
            Actor_ID: parseInt(id),
            Actor_Name,
            Gender,
            Nationality
        });
    } catch (error) {
        console.error('Actor update error:', error);
        res.status(500).json({ error: 'Failed to update actor' });
    }
});

app.delete('/api/actors/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await query('DELETE FROM Actor WHERE Actor_ID = ?', [id]);
        res.json({ message: 'Actor deleted successfully' });
    } catch (error) {
        console.error('Actor delete error:', error);
        res.status(500).json({ error: 'Failed to delete actor' });
    }
});

// Awards routes (3NF Normalized - Festival_ID removed)
app.get('/api/awards', async (req, res) => {
    try {
        const awards = await query(`
            SELECT a.*, m.Title as Movie_Title, f.Festival_Name 
            FROM Award a 
            LEFT JOIN Movie m ON a.Movie_ID = m.Movie_ID 
            LEFT JOIN Festival f ON m.Festival_ID = f.Festival_ID 
            ORDER BY a.Award_Name
        `);
        res.json(awards);
    } catch (error) {
        console.error('Awards fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch awards' });
    }
});

app.post('/api/awards', async (req, res) => {
    try {
        const { Award_Name, Year, Movie_ID } = req.body;
        
        if (!Award_Name) {
            return res.status(400).json({ error: 'Award name is required' });
        }
        
        const result = await query(
            'INSERT INTO Award (Award_Name, Year, Movie_ID) VALUES (?, ?, ?)',
            [Award_Name, Year, Movie_ID || null]
        );
        
        res.status(201).json({
            Award_ID: result.insertId,
            Award_Name,
            Year,
            Movie_ID
        });
    } catch (error) {
        console.error('Award create error:', error);
        res.status(500).json({ error: 'Failed to add award' });
    }
});

app.put('/api/awards/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { Award_Name, Year, Movie_ID } = req.body;
        
        if (!Award_Name) {
            return res.status(400).json({ error: 'Award name is required' });
        }
        
        await query(
            'UPDATE Award SET Award_Name = ?, Year = ?, Movie_ID = ? WHERE Award_ID = ?',
            [Award_Name, Year, Movie_ID || null, id]
        );
        
        res.json({ 
            message: 'Award updated successfully',
            Award_ID: parseInt(id),
            Award_Name,
            Year,
            Movie_ID
        });
    } catch (error) {
        console.error('Award update error:', error);
        res.status(500).json({ error: 'Failed to update award' });
    }
});

app.delete('/api/awards/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await query('DELETE FROM Award WHERE Award_ID = ?', [id]);
        res.json({ message: 'Award deleted successfully' });
    } catch (error) {
        console.error('Award delete error:', error);
        res.status(500).json({ error: 'Failed to delete award' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎬 Film Festival DBMS server running on port ${PORT}`);
    console.log(`📊 Visit http://localhost:${PORT} to access the application`);
});