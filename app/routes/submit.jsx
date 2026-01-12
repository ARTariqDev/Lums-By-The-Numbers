import Navbar from '../components/navbar';


export function meta() {
  return [
    { title: "Submit Your Data - Lums By The Numbers" },
    { name: "description", content: "Submit your LUMS admissions data to help future applicants. Share your SAT scores and O Level grades anonymously." },
  ];
}

export default function Submit() {
  return (
    <>
      <Navbar />
      <div className="pt-16 pb-4" style={{ height: '100vh' }}>
        <div className="w-full h-full px-4 md:px-6">
          <iframe 
            src="https://form.fillout.com/t/59qZiEFuyHus" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              minHeight: '700px'
            }}
            title="Submit Your Data"
          />
        </div>
      </div>
    </>
  );
}
