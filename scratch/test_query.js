import { insforge } from './src/services/api.js';

async function testQuery() {
  const jobId = '39761c8f-5e11-4dbc-ab4a-ea55cb99bb6e'; // Job with an application
  const { data, error } = await insforge.database
    .from('applications')
    .select('*, profiles(name, skills, avatar_url, university), jobs(title)')
    .eq('job_id', jobId);
  
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

testQuery();
