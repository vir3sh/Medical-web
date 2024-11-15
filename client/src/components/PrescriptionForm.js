import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';

const PrescriptionForm = () => {
  const { consultationId } = useParams(); // Consultation ID from the URL
  const history = useHistory();
  const [care, setCare] = useState('');
  const [medicines, setMedicines] = useState('');
  const [consultation, setConsultation] = useState(null);

  useEffect(() => {
    const fetchConsultationDetails = async () => {
      try {
        const res = await axios.get(`/api/consultations/${consultationId}`); // Fetch consultation details
        setConsultation(res.data);
      } catch (error) {
        console.error('Error fetching consultation details', error);
      }
    };
    fetchConsultationDetails();
  }, [consultationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prescription = {
      care,
      medicines,
    };

    try {
      await axios.post(`/api/prescriptions/${consultationId}`, prescription); // Submit prescription for consultation
      history.push('/prescription');
    } catch (error) {
      console.error('Error submitting prescription', error);
    }
  };

  return (
    <div>
      <h1>Write Prescription</h1>
      {consultation && (
        <div>
          <h3>Patient: {consultation.patientName}</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Care to be taken: </label>
              <textarea
                value={care}
                onChange={(e) => setCare(e.target.value)}
                required
              ></textarea>
            </div>
            <div>
              <label>Medicines: </label>
              <textarea
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit">Submit Prescription</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
