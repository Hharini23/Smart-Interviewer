import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/interviews/generate', {
      role: 'React Developer',
      experienceLevel: 'Entry Level',
      type: 'Technical'
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Backend Error:", err.response.data);
    } else {
      console.error("Connection Error:", err.message);
    }
  }
}

test();
