import { useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onUpload = async () => {
    if (!file) {
      alert('Please choose a file first');
      return;
    }

    const searchParams = new URLSearchParams(window.location.search)
    const secretId = searchParams.get('token');
    console.log(secretId)

    if (!searchParams.has('token')) {
      alert('No token provided');
      return;
    }

    const { data, error: selectError } = await supabase.from('Tokens').select('expire_at').eq('unique_id', secretId);

    if(selectError) {
      console.error('Error selecting data:', selectError)
      alert('Invalid token')
      return
    }

    if (data.length === 0) {
      console.error('Error - Invalid token')
      alert('Invalid token')
      return
    }

    const expire_date = new Date(data[0].expire_at)
    const now = new Date()

    if (now > expire_date) {
      console.error('Expired Token')
      alert('Expired Token')
      return
    }
  
    const filePath = `uploads/${file.name}`;
    const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
  
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      alert('Error uploading file');
    } else {
      const { data, error } = await supabase.storage.from('uploads').getPublicUrl(filePath);
    
    if (error) {
      console.error('Error getting public URL:', error);
      alert('Error getting public URL');
    } else {
      console.log(data.publicUrl)
      setUrl(data.publicUrl);
    }
    }
  };

  return (
    <div className="App">
      <input type="file" onChange={onFileChange} />
      <button onClick={onUpload}>Upload</button>
      {url && (
        <div>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;