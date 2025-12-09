export default function(){
     const fetchPatientData = async () => {
       try {
         const res = await getDoctorList();
         seDoctorList(res);
       } catch (err) {
         console.error("Error fetching doctor list:", err);
       }
     };
      useEffect(() => {
         fetchPatientData();
       }, []);
}