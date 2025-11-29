/**
 * Example usage of dashboard service
 * This file shows how to use the dashboard service in your components
 */

import { getPatientList, createPatient, updatePatient, deletePatient, getPatientById } from "./dashboard";

// Example 1: Get patient list with pagination
export const exampleGetPatientList = async () => {
  try {
    // Get first page
    const result = await getPatientList({ page: 1 });
    
    console.log("Patient list:", result.patients);
    console.log("Total items:", result.totalItems);
    console.log("Total pages:", result.totalPages);
    console.log("Next page:", result.nextPage);
    console.log("Previous page:", result.previousPage);
    
    // Get second page
    if (result.nextPage > 0) {
      const nextPageResult = await getPatientList({ page: result.nextPage });
      console.log("Next page patients:", nextPageResult.patients);
    }
    
    // Search patients
    const searchResult = await getPatientList({ page: 1, search: "Anita" });
    console.log("Search results:", searchResult.patients);
    
    return result;
  } catch (error) {
    console.error("Error fetching patients:", error);
  }
};

// Example 2: Use in a React component
export const exampleComponentUsage = () => {
  // In your component:
  /*
  'use client'
  
  import { useState, useEffect } from 'react'
  import { getPatientList } from '@/lib/services/dashboard'
  
  export default function PatientList() {
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({})
    
    useEffect(() => {
      const fetchPatients = async () => {
        setLoading(true)
        try {
          const result = await getPatientList({ page })
          setPatients(result.patients)
          setPagination({
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            nextPage: result.nextPage,
            previousPage: result.previousPage,
          })
        } catch (error) {
          console.error('Error fetching patients:', error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchPatients()
    }, [page])
    
    return (
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {patients.map(patient => (
              <li key={patient.id}>
                {patient.name} - {patient.email} - {patient.phone_primary}
              </li>
            ))}
          </ul>
        )}
        
        <div>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={pagination.previousPage === -1}
          >
            Previous
          </button>
          <span>Page {page} of {pagination.totalPages}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={pagination.nextPage === -1}
          >
            Next
          </button>
        </div>
      </div>
    )
  }
  */
};

// Example 3: Create a new patient
export const exampleCreatePatient = async () => {
  try {
    const newPatient = await createPatient({
      name: "John Doe",
      age: 30,
      email: "john.doe@example.com",
      phone_primary: "9876543210",
      city: "Mumbai",
    });
    
    console.log("Patient created:", newPatient);
    return newPatient;
  } catch (error) {
    console.error("Error creating patient:", error);
  }
};

// Example 4: Update a patient
export const exampleUpdatePatient = async (patientId) => {
  try {
    const updatedPatient = await updatePatient(patientId, {
      name: "John Doe Updated",
      age: 31,
    });
    
    console.log("Patient updated:", updatedPatient);
    return updatedPatient;
  } catch (error) {
    console.error("Error updating patient:", error);
  }
};

// Example 5: Get patient by ID
export const exampleGetPatient = async (patientId) => {
  try {
    const patient = await getPatientById(patientId);
    console.log("Patient:", patient);
    return patient;
  } catch (error) {
    console.error("Error fetching patient:", error);
  }
};

// Example 6: Delete a patient
export const exampleDeletePatient = async (patientId) => {
  try {
    const success = await deletePatient(patientId);
    console.log("Patient deleted:", success);
    return success;
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
};

