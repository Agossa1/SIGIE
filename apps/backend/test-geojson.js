require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@192.168.100.10:5432/envdev'
});
pool.query('SELECT ST_AsGeoJSON(geometry)::json as geom FROM territories WHERE level = \'region\' LIMIT 1')
  .then(res => {
    console.log(JSON.stringify(res.rows[0], null, 2));
    pool.end();
  }).catch(e => console.error(e));
