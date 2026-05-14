import { useEffect, useRef, useState, useContext } from 'react';
import { SettingsContext } from '../context';

let Bar, Scatter, Chart;
let ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend;
let BoxPlotController, BoxAndWiskers;

const schoolColors = {
  'MGHSS (Economics)': '#FF6384',
  'MGHSS (Social Sciences)': '#FF9FB2',
  'SBASSE': '#36A2EB',
  'SDSB': '#FFCE56',
  'SAHSOL': '#4BC0C0',
};

export default function Graphs() {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [educationSystem, setEducationSystem] = useState('O/A-Levels');
  const [schools, setSchools] = useState([]);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const sectionRef = useRef(null);
  
  const settings = useContext(SettingsContext);
  const showGrades = settings?.showGrades ?? true;
  
  const estimateGrades = (points, isAsLevel = false) => {
    if (!points || isNaN(points)) return points;
    if (isAsLevel) {
      const aCount = Math.floor(points / 10);
      const bCount = Math.floor((points % 10) / 5);
      let str = [];
      if (aCount > 0) str.push(`${aCount}a`);
      if (bCount > 0) str.push(`${bCount}b`);
      return str.length > 0 ? `~ ${str.join(', ')}` : `${points}`;
    } else {
      const aStar = Math.round(points / 10);
      return aStar > 0 ? `~ ${aStar}A*` : `${points}`;
    }
  };

  const [userSAT, setUserSAT] = useState('');
  const [userOLevels, setUserOLevels] = useState('');
  const [userASLevels, setUserASLevels] = useState('');
  const [userMatric, setUserMatric] = useState('');
  const [userFSc, setUserFSc] = useState('');
  const [userAStars, setUserAStars] = useState('');
  const [userAs, setUserAs] = useState('');
  const [userSmallAs, setUserSmallAs] = useState('');
  const [userSmallBs, setUserSmallBs] = useState('');
  const [inputMode, setInputMode] = useState('grades');
  const [desiredSchool, setDesiredSchool] = useState('');
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    Promise.all([
      import('chart.js'),
      import('@sgratzl/chartjs-chart-boxplot'),
      import('react-chartjs-2')
    ]).then(([chartModule, boxplotModule, chartjsModule]) => {
      ChartJS = chartModule.Chart;
      CategoryScale = chartModule.CategoryScale;
      LinearScale = chartModule.LinearScale;
      BarElement = chartModule.BarElement;
      PointElement = chartModule.PointElement;
      LineElement = chartModule.LineElement;
      Title = chartModule.Title;
      Tooltip = chartModule.Tooltip;
      Legend = chartModule.Legend;

      BoxPlotController = boxplotModule.BoxPlotController;
      BoxAndWiskers = boxplotModule.BoxAndWiskers;

      ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        BoxPlotController,
        BoxAndWiskers
      );

      Bar = chartjsModule.Bar;
      Scatter = chartjsModule.Scatter;
      Chart = chartjsModule.Chart;
      setChartsLoaded(true);
    }).catch((err) => console.error('Error loading charts:', err));

    fetch('/data.json')
      .then((res) => res.json())
      .then((jsonData) => {
        setData(jsonData);
        const uniqueSchools = [...new Set(jsonData.map((d) => d.School))];
        setSchools(uniqueSchools);
        setSelectedSchools(uniqueSchools);
      })
      .catch((err) => console.error('Error loading data:', err));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const combinedFilteredData = data.filter((d) => {
    const matchSchool = selectedSchools.includes(d.School);
    const matchYear = selectedYear === 'All' ? true : d.Year === parseInt(selectedYear);
    return matchSchool && matchYear;
  });

  const filteredData = data.filter((d) => {
    const matchSchool = selectedSchools.includes(d.School);
    const matchYear = selectedYear === 'All' ? true : d.Year === parseInt(selectedYear);
    const matchSystem = educationSystem === 'O/A-Levels' ? d.O_Levels !== null : (d.Matric !== null || d.FSc !== null);
    return matchSchool && matchYear && matchSystem;
  });

  const toggleSchool = (school) => {
    setSelectedSchools((prev) =>
      prev.includes(school)
        ? prev.filter((s) => s !== school)
        : [...prev, school]
    );
  };

  const toggleAll = () => {
    if (selectedSchools.length === schools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(schools);
    }
  };

  // Calculate O Levels points from grades
  const calculateOLevelsPoints = (aStars, as) => {
    return (parseInt(aStars) || 0) * 10 + (parseInt(as) || 0) * 7;
  };

  const calculateASLevelsPoints = (smallAs, smallBs) => {
    if (!smallAs && !smallBs) return null;
    return (parseInt(smallAs) || 0) * 10 + (parseInt(smallBs) || 0) * 5;
  };


  const getUserOLevels = () => {
    if (educationSystem === 'Matric/FSc') {
      return userFSc ? parseFloat(userFSc) : parseFloat(userMatric);
    }
    if (inputMode === 'points') {
      return parseFloat(userOLevels);
    } else {
      return calculateOLevelsPoints(userAStars, userAs);
    }
  };

  const getUserASLevels = () => {
    if (educationSystem === 'Matric/FSc') return null;
    if (inputMode === 'points') {
      return userASLevels ? parseFloat(userASLevels) : null;
    } else {
      return calculateASLevelsPoints(userSmallAs, userSmallBs);
    }
  };


  const calculateQuartiles = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q2 = sorted[Math.floor(sorted.length * 0.5)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    return { q1, q2, q3 };
  };

  const predictSchool = () => {
    const sat = parseFloat(userSAT);
    const oLevels = getUserOLevels();

    if (!sat || !oLevels || sat < 400 || sat > 1600 || oLevels < 0) {
      setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(), error: 'Please enter valid scores' });
      return;
    }

    const predictorData = combinedFilteredData.filter(d => educationSystem === 'O/A-Levels' ? d.O_Levels !== null : (d.Matric !== null || d.FSc !== null));

    const schoolStats = {};
    schools.forEach(school => {
      const schoolData = predictorData.filter(d => d.School === school);
      const satValues = schoolData.map(d => d.SAT).filter(n => n);
      const oLevelsValues = schoolData.map(d => educationSystem === 'O/A-Levels' ? d.O_Levels : d.FSc || d.Matric).filter(n => n);
      schoolStats[school] = {
        sat: calculateQuartiles(satValues),
        oLevels: calculateQuartiles(oLevelsValues),
      };
    });

    // Check if above UQ for all schools (regardless of desired school)
    const aboveAllSchools = schools.every(school => {
      const s = schoolStats[school];
      return sat >= s.sat.q3 && oLevels >= s.oLevels.q3;
    });

    if (aboveAllSchools) {
      setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
        result: 'Highly competitive for any school',
        message: `Excellent! Your scores are above the upper quartile for all schools. You're a strong candidate for admission to any program.`,
        sat,
        oLevels,
      });
      return;
    }

    // Check if below minimum viable scores for ALL schools
    const belowAllSchools = schools.every(school => {
      const s = schoolStats[school];
      const satMargin = s.sat.q1 - 20;
      const oLevelsMargin = s.oLevels.q1 - 10;
      return sat < satMargin || oLevels < oLevelsMargin;
    });

    if (belowAllSchools) {
      setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
        result: 'Not likely to be admitted',
        message: `Your scores are significantly below the typical range for all schools. Consider strengthening your academic profile before applying.`,
        sat,
        oLevels,
      });
      return;
    }

    if (desiredSchool && schoolStats[desiredSchool]) {
      const stats = schoolStats[desiredSchool];
      const satLQ = stats.sat.q1;
      const satUQ = stats.sat.q3;
      const oLevelsLQ = stats.oLevels.q1;
      const oLevelsUQ = stats.oLevels.q3;

      if (sat >= satUQ && oLevels >= oLevelsUQ) {
        setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
          result: `Strong candidate for ${desiredSchool}`,
          message: `Your scores are above the upper quartile for ${desiredSchool}. You have a strong chance of admission!`,
          sat,
          oLevels,
        });
        return;
      }


      const satBelowLQ = sat < satLQ;
      const oLevelsBelowLQ = oLevels < oLevelsLQ;
      const satMargin = satLQ - 20;
      const oLevelsMargin = oLevelsLQ - 10;
      const satGraceMargin = satLQ - 40;
      const oLevelsGraceMargin = oLevelsLQ - 20;

      if ((sat < satMargin && oLevels < oLevelsMargin) || sat < satMargin - 20 || oLevels < oLevelsMargin - 10) {
        const alternativeSchools = schools.filter(school => {
          if (school === desiredSchool) return false;
          const s = schoolStats[school];
          return sat >= s.sat.q1 - 40 && oLevels >= s.oLevels.q1 - 20;
        });

        let message = `Your scores are significantly below the typical range for ${desiredSchool}.`;
        
        if (alternativeSchools.length > 0) {
          message += ` However, you may be competitive for: ${alternativeSchools.join(', ')}.`;
        } else {
          message += ' Consider strengthening your application or exploring other schools.';
        }

        setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
          result: `Not likely to be admitted to ${desiredSchool}`,
          message,
          sat,
          oLevels,
        });
        return;
      }

      if (satBelowLQ && !oLevelsBelowLQ) {
        if (sat >= satGraceMargin) {
          setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
            result: `Competitive for ${desiredSchool}`,
            message: `Your ${educationSystem === 'O/A-Levels' ? 'O Levels' : 'Matric/FSc'} are strong for ${desiredSchool}. Your SAT score is slightly below the median but still competitive.`,
            sat,
            oLevels,
          });
          return;
        } else {
          setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
            result: `Possible but unlikely for ${desiredSchool}`,
            message: `Your SAT score is below the lower quartile for ${desiredSchool}, though your O Levels are strong. Admission is possible but may be challenging.`,
            sat,
            oLevels,
          });
          return;
        }
      } else if (oLevelsBelowLQ && !satBelowLQ) {
        if (oLevels >= oLevelsGraceMargin) {
          setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
            result: `Competitive for ${desiredSchool}`,
            message: `Your SAT score is strong for ${desiredSchool}. Your ${educationSystem === 'O/A-Levels' ? 'O Levels' : 'Matric/FSc'} are slightly below the median but still competitive.`,
            sat,
            oLevels,
          });
          return;
        } else {
          setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
            result: `Possible but unlikely for ${desiredSchool}`,
            message: `Your ${educationSystem === 'O/A-Levels' ? 'O Levels' : 'Matric/FSc'} are below the lower quartile for ${desiredSchool}, though your SAT score is strong. Admission is possible but may be challenging.`,
            sat,
            oLevels,
          });
          return;
        }
      } else if (satBelowLQ && oLevelsBelowLQ) {
        setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
          result: `Possible but unlikely for ${desiredSchool}`,
          message: `Your scores are below the lower quartile for ${desiredSchool}. Admission is possible but may be challenging. Consider strengthening other aspects of your application.`,
          sat,
          oLevels,
        });
        return;
      }

      setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
        result: `Good fit for ${desiredSchool}`,
        message: `Your scores are within the competitive range for ${desiredSchool}. You have a reasonable chance of admission.`,
        sat,
        oLevels,
      });
      return;
    }

    const unmappedAsLevels = getUserASLevels();
    const parsedAsLevels = unmappedAsLevels !== null ? parseFloat(unmappedAsLevels) : null;

    const distances = predictorData.filter(d => d.School && d.SAT).map(d => {
      const dbSat = d.SAT;
      const dbOLevels = educationSystem === 'O/A-Levels' ? d.O_Levels : (d.FSc || d.Matric);
      let distSq = Math.pow(dbSat - sat, 2) + Math.pow(dbOLevels - oLevels, 2);
      
      if (parsedAsLevels !== null && d.AS_Levels) {
        distSq += Math.pow(d.AS_Levels - parsedAsLevels, 2);
      }

      return {
        school: d.School,
        distance: Math.sqrt(distSq),
      };
    }).sort((a, b) => a.distance - b.distance);

    const k = 5;
    const nearestK = distances.slice(0, k);
    
    // Count schools in nearest neighbors
    const schoolCounts = {};
    nearestK.forEach(d => {
      schoolCounts[d.school] = (schoolCounts[d.school] || 0) + 1;
    });

    // If user has desired school and it's in top matches, prioritize it
    let predictedSchool = nearestK[0].school;
    if (desiredSchool && schoolCounts[desiredSchool]) {
      predictedSchool = desiredSchool;
    } else {
      // Otherwise pick most common school in nearest neighbors
      predictedSchool = Object.keys(schoolCounts).reduce((a, b) => 
        schoolCounts[a] > schoolCounts[b] ? a : b
      );
    }

    setPrediction({
      system: educationSystem,
      matric: userMatric ? parseFloat(userMatric) : null,
      fsc: userFSc ? parseFloat(userFSc) : null,
      asLevels: getUserASLevels(),
      result: `Good fit for ${predictedSchool}`,
      message: `Based on similar admitted students, you may be a competitive candidate for ${predictedSchool}.`,
      sat,
      oLevels,
    });
  };

  // Calculate averages
  const avgSAT = combinedFilteredData.length > 0
    ? (combinedFilteredData.reduce((sum, d) => sum + d.SAT, 0) / combinedFilteredData.length).toFixed(0)
    : 0;
  
  const validOLevels = filteredData.filter(d => d.O_Levels && !isNaN(d.O_Levels));
  const avgOLevels = validOLevels.length > 0
    ? (validOLevels.reduce((sum, d) => sum + d.O_Levels, 0) / validOLevels.length).toFixed(1)
    : 0;

  const validASLevels = filteredData.filter(d => d.AS_Levels && !isNaN(d.AS_Levels));
  const avgASLevels = validASLevels.length > 0
    ? (validASLevels.reduce((sum, d) => sum + d.AS_Levels, 0) / validASLevels.length).toFixed(1)
    : 0;

  const validMatric = filteredData.filter(d => d.Matric && !isNaN(d.Matric));
  const avgMatric = validMatric.length > 0
    ? (validMatric.reduce((sum, d) => sum + d.Matric, 0) / validMatric.length).toFixed(1)
    : 0;

  const validFSc = filteredData.filter(d => d.FSc && !isNaN(d.FSc));
  const avgFSc = validFSc.length > 0
    ? (validFSc.reduce((sum, d) => sum + d.FSc, 0) / validFSc.length).toFixed(1)
    : 0;

  const allSATScores = [...new Set(combinedFilteredData.map(d => d.SAT))].sort((a, b) => a - b);
  const satDatasets = schools
    .filter(school => selectedSchools.includes(school))
    .map(school => {
      const schoolData = combinedFilteredData.filter(d => d.School === school);
      const frequency = {};
      allSATScores.forEach(score => {
        frequency[score] = schoolData.filter(d => d.SAT === score).length;
      });
      return {
        label: school,
        data: allSATScores.map(score => frequency[score] || 0),
        backgroundColor: schoolColors[school] + 'CC',
        borderColor: schoolColors[school],
        borderWidth: 2,
      };
    });

  const satDistData = {
    labels: allSATScores,
    datasets: satDatasets,
  };


  const allOLevelsScores = [...new Set(filteredData.map(d => educationSystem === 'O/A-Levels' ? d.O_Levels : d.FSc || d.Matric))].sort((a, b) => a - b);
  const oLevelsDatasets = schools
    .filter(school => selectedSchools.includes(school))
    .map(school => {
      const schoolData = filteredData.filter(d => d.School === school);
      const frequency = {};
      allOLevelsScores.forEach(score => {
        frequency[score] = schoolData.filter(d => (educationSystem === 'O/A-Levels' ? d.O_Levels : d.FSc || d.Matric) === score).length;
      });
      return {
        label: school,
        data: allOLevelsScores.map(score => frequency[score] || 0),
        backgroundColor: schoolColors[school] + 'CC',
        borderColor: schoolColors[school],
        borderWidth: 2,
      };
    });

  const oLevelsDistData = {
    labels: allOLevelsScores,
    datasets: oLevelsDatasets,
  };


  const satBoxData = {
    labels: ['SAT Scores'],
    datasets: schools
      .filter(school => selectedSchools.includes(school))
      .map(school => ({
        label: school,
        data: [combinedFilteredData.filter(d => d.School === school).map(d => d.SAT)],
        backgroundColor: schoolColors[school] + '80',
        borderColor: schoolColors[school],
        borderWidth: 2,
        outlierColor: schoolColors[school],
        padding: 10,
        itemRadius: 3,
        coef: 3,
      })),
  };

  const oLevelsBoxData = {
    labels: [educationSystem === 'O/A-Levels' ? 'O Levels Points' : 'Matric %'],
    datasets: schools
      .filter(school => selectedSchools.includes(school))
      .map(school => ({
        label: school,
        data: [filteredData.filter(d => d.School === school).map(d => educationSystem === 'O/A-Levels' ? d.O_Levels : d.Matric).filter(n => n !== null)],
        backgroundColor: schoolColors[school] + '80',
        borderColor: schoolColors[school],
        borderWidth: 2,
        outlierColor: schoolColors[school],
        padding: 10,
        itemRadius: 3,
        coef: 3,
      })),
  };

  const asLevelsBoxData = {
    labels: ['AS Levels Points'],
    datasets: schools
      .filter(school => selectedSchools.includes(school))
      .map(school => ({
        label: school,
        data: [filteredData.filter(d => d.School === school && d.AS_Levels !== null).map(d => d.AS_Levels)],
        backgroundColor: schoolColors[school] + '80',
        borderColor: schoolColors[school],
        borderWidth: 2,
        outlierColor: schoolColors[school],
        padding: 10,
        itemRadius: 3,
        coef: 3,
      })),
  };

  const fscBoxData = {
    labels: ['FSc %'],
    datasets: schools
      .filter(school => selectedSchools.includes(school))
      .map(school => ({
        label: school,
        data: [filteredData.filter(d => d.School === school).map(d => d.FSc).filter(n => n !== null)],
        backgroundColor: schoolColors[school] + '80',
        borderColor: schoolColors[school],
        borderWidth: 2,
        outlierColor: schoolColors[school],
        padding: 10,
        itemRadius: 3,
        coef: 3,
      })),
  };


  const oLevelsScatterDatasets = schools
    .filter(school => selectedSchools.includes(school))
    .map((school) => ({
      label: school,
      data: filteredData
        .filter((d) => d.School === school && d.O_Levels !== null)
        .map((d) => ({ x: d.SAT, y: d.O_Levels, merit: d.merit_scholarship, second_pref: d.second_pref, first_pref: d.first_pref })),
      backgroundColor: schoolColors[school],
      pointBackgroundColor: (ctx) => ctx.raw?.second_pref && ctx.raw?.first_pref ? schoolColors[ctx.raw.first_pref] : schoolColors[school],
      borderColor: schoolColors[school],
      pointBorderColor: schoolColors[school],
      pointBorderWidth: (ctx) => ctx.raw?.second_pref ? 3 : 1,
      pointRadius: (ctx) => ctx.raw?.merit ? (window.innerWidth < 768 ? 6 : 10) : (ctx.raw?.second_pref ? (window.innerWidth < 768 ? 5 : 7) : (window.innerWidth < 768 ? 2.5 : 5)),
      pointStyle: (ctx) => ctx.raw?.merit ? 'star' : (ctx.raw?.second_pref ? 'triangle' : 'circle'),
      pointHoverRadius: window.innerWidth < 768 ? 4 : 7,
    }));

  const asLevelsScatterDatasets = schools
    .filter(school => selectedSchools.includes(school))
    .map((school) => ({
      label: school,
      data: filteredData
        .filter((d) => d.School === school && d.AS_Levels !== null)
        .map((d) => ({ x: d.SAT, y: d.AS_Levels, merit: d.merit_scholarship, second_pref: d.second_pref, first_pref: d.first_pref })),
      backgroundColor: schoolColors[school],
      pointBackgroundColor: (ctx) => ctx.raw?.second_pref && ctx.raw?.first_pref ? schoolColors[ctx.raw.first_pref] : schoolColors[school],
      borderColor: schoolColors[school],
      pointBorderColor: schoolColors[school],
      pointBorderWidth: (ctx) => ctx.raw?.second_pref ? 3 : 1,
      pointRadius: (ctx) => ctx.raw?.merit ? (window.innerWidth < 768 ? 6 : 10) : (ctx.raw?.second_pref ? (window.innerWidth < 768 ? 5 : 7) : (window.innerWidth < 768 ? 2.5 : 5)),
      pointStyle: (ctx) => ctx.raw?.merit ? 'star' : (ctx.raw?.second_pref ? 'triangle' : 'circle'),
      pointHoverRadius: window.innerWidth < 768 ? 4 : 7,
    }));

  const matricScatterDatasets = schools
    .filter(school => selectedSchools.includes(school))
    .map((school) => ({
      label: school,
      data: filteredData
        .filter((d) => d.School === school && d.Matric !== null)
        .map((d) => ({ x: d.SAT, y: d.Matric, merit: d.merit_scholarship, second_pref: d.second_pref, first_pref: d.first_pref })),
      backgroundColor: schoolColors[school],
      pointBackgroundColor: (ctx) => ctx.raw?.second_pref && ctx.raw?.first_pref ? schoolColors[ctx.raw.first_pref] : schoolColors[school],
      borderColor: schoolColors[school],
      pointBorderColor: schoolColors[school],
      pointBorderWidth: (ctx) => ctx.raw?.second_pref ? 3 : 1,
      pointRadius: (ctx) => ctx.raw?.merit ? (window.innerWidth < 768 ? 6 : 10) : (ctx.raw?.second_pref ? (window.innerWidth < 768 ? 5 : 7) : (window.innerWidth < 768 ? 2.5 : 5)),
      pointStyle: (ctx) => ctx.raw?.merit ? 'star' : (ctx.raw?.second_pref ? 'triangle' : 'circle'),
      pointHoverRadius: window.innerWidth < 768 ? 4 : 7,
    }));

  const fscScatterDatasets = schools
    .filter(school => selectedSchools.includes(school))
    .map((school) => ({
      label: school,
      data: filteredData
        .filter((d) => d.School === school && d.FSc !== null)
        .map((d) => ({ x: d.SAT, y: d.FSc, merit: d.merit_scholarship, second_pref: d.second_pref, first_pref: d.first_pref })),
      backgroundColor: schoolColors[school],
      pointBackgroundColor: (ctx) => ctx.raw?.second_pref && ctx.raw?.first_pref ? schoolColors[ctx.raw.first_pref] : schoolColors[school],
      borderColor: schoolColors[school],
      pointBorderColor: schoolColors[school],
      pointBorderWidth: (ctx) => ctx.raw?.second_pref ? 3 : 1,
      pointRadius: (ctx) => ctx.raw?.merit ? (window.innerWidth < 768 ? 6 : 10) : (ctx.raw?.second_pref ? (window.innerWidth < 768 ? 5 : 7) : (window.innerWidth < 768 ? 2.5 : 5)),
      pointStyle: (ctx) => ctx.raw?.merit ? 'star' : (ctx.raw?.second_pref ? 'triangle' : 'circle'),
      pointHoverRadius: window.innerWidth < 768 ? 4 : 7,
    }));

  if (prediction && prediction.sat) {
    const youBase = {
      label: 'You',
      backgroundColor: '#00FF00',
      borderColor: '#FFFFFF',
      borderWidth: 2,
      pointRadius: window.innerWidth < 768 ? 5 : 9,
      pointHoverRadius: window.innerWidth < 768 ? 7 : 11,
      pointStyle: 'star',
    };
    
    if (prediction.system === 'O/A-Levels' && educationSystem === 'O/A-Levels') {
      if (prediction.oLevels !== null) oLevelsScatterDatasets.push({ ...youBase, data: [{ x: prediction.sat, y: prediction.oLevels }] });
      if (prediction.asLevels !== null) asLevelsScatterDatasets.push({ ...youBase, data: [{ x: prediction.sat, y: prediction.asLevels }] });
    } else if (prediction.system === 'Matric/FSc' && educationSystem === 'Matric/FSc') {
      if (prediction.matric !== null) matricScatterDatasets.push({ ...youBase, data: [{ x: prediction.sat, y: prediction.matric }] });
      if (prediction.fsc !== null) fscScatterDatasets.push({ ...youBase, data: [{ x: prediction.sat, y: prediction.fsc }] });
    }
  }

  const oLevelsScatterData = { datasets: oLevelsScatterDatasets };
  const asLevelsScatterData = { datasets: asLevelsScatterDatasets };
  const matricScatterData = { datasets: matricScatterDatasets };
  const fscScatterData = { datasets: fscScatterDatasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isVisible ? 1500 : 0,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: { size: 14, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        padding: 8,
        bodyFont: { size: 12 },
        titleFont: { size: 13, weight: 'bold' },
        displayColors: true,
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        caretSize: 6,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            if (value && typeof value === 'object') {

              return [
                `Min: ${value.min?.toFixed(0) || 'N/A'}`,
                `Q1: ${value.q1?.toFixed(0) || 'N/A'}`,
                `Median: ${value.median?.toFixed(0) || 'N/A'}`,
                `Q3: ${value.q3?.toFixed(0) || 'N/A'}`,
                `Max: ${value.max?.toFixed(0) || 'N/A'}`
              ];
            }
            return `Value: ${value}`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const getScatterOptions = (yAxisLabel, yAxisTitle) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isVisible ? 1500 : 0,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: { size: 14, family: 'Inter' },
          usePointStyle: true,
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            
            // Find all unique 1st -> 2nd combinations in the filtered data
            const combos = new Set();
            filteredData.forEach(d => {
              if (d.second_pref && d.first_pref) {
                combos.add(`${d.first_pref}->${d.School}`);
              }
            });
            
            const comboLegends = Array.from(combos).map((combo, i) => {
              const [first, second] = combo.split('->');
              return {
                text: `${second} (1st: ${first})`,
                pointStyle: 'triangle',
                fillStyle: schoolColors[first] || 'transparent',
                strokeStyle: schoolColors[second] || '#ffffff',
                lineWidth: 3,
                hidden: false,
                datasetIndex: `_custom_combo_${i}`
              };
            });

            return [
              ...original,
              { 
                text: 'Merit Scholarship', 
                pointStyle: 'star', 
                fillStyle: '#FFCE56',
                strokeStyle: '#FFCE56',
                hidden: false,
                datasetIndex: '_custom_merit'
              },
              ...comboLegends
            ];
          }
        },
        onClick: (e, legendItem, legend) => {
          if (legendItem.datasetIndex !== '_custom_merit' && !String(legendItem.datasetIndex).startsWith('_custom_combo_')) {
            ChartJS.defaults.plugins.legend.onClick.call(legend, e, legendItem, legend);
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        padding: 8,
        bodyFont: { size: 12 },
        titleFont: { size: 13, weight: 'bold' },
        displayColors: true,
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        caretSize: 6,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const merit = context.raw?.merit ? 'Merit Scholarship' : '';
            const secondPref = context.raw?.second_pref ? `Admitted to ${context.dataset.label} (2nd Pref)` : '';
            const firstPref = context.raw?.first_pref ? `Rejected from: ${context.raw.first_pref} (1st Pref)` : '';
            const labelArr = [
              `SAT: ${context.parsed.x}`,
              `${yAxisLabel}: ${context.parsed.y}`
            ];
            if (merit) labelArr.push(merit);
            if (secondPref) labelArr.push(secondPref);
            if (firstPref) labelArr.push(firstPref);
            return labelArr;
          }
        }
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'SAT Score', color: '#ffffff', font: { size: 14 } },
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        title: { display: true, text: yAxisTitle, color: '#ffffff', font: { size: 14 } },
        ticks: { 
          color: '#ffffff', 
          font: { size: 12 },
          callback: function(value) {
            if (showGrades && educationSystem === 'O/A-Levels') {
              const isAs = yAxisLabel.includes('AS Levels');
              return `${estimateGrades(value, isAs)} (${value})`;
            }
            return value;
          }
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  });

  const scatterOptions = getScatterOptions(
    educationSystem === 'O/A-Levels' ? 'O Levels' : 'Matric/FSc %',
    educationSystem === 'O/A-Levels' ? 'O Levels Points' : 'Matric/FSc (%)'
  );

  const satBoxOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        min: 1100,
        max: 1600,
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const oLevelsBoxOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        min: educationSystem === 'O/A-Levels' ? 30 : 60,
        max: educationSystem === 'O/A-Levels' ? 150 : 100,
        ticks: { 
          color: '#ffffff', 
          font: { size: 12 },
          stepSize: educationSystem === 'O/A-Levels' ? 30 : 10,
          callback: function(value) {
            return (showGrades && educationSystem === 'O/A-Levels') ? `${estimateGrades(value)} (${value})` : value;
          }
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  const asLevelsBoxOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: { color: '#ffffff', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        min: 0,
        max: 60,
        ticks: { 
          color: '#ffffff', 
          font: { size: 12 },
          stepSize: 10,
          callback: function(value) {
            return (showGrades && educationSystem === 'O/A-Levels') ? `${estimateGrades(value, true)} (${value})` : value;
          }
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  if (!data.length || !chartsLoaded) {
    return (
      <section ref={sectionRef} className="relative min-h-screen py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-16 text-center">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-3 md:mb-4 tracking-wide">
              Data Visualizations
            </h2>
            <p className="text-white text-base md:text-lg lg:text-xl font-light opacity-70">
              Interactive insights from admissions data
            </p>
            <div className="w-24 md:w-32 h-1 bg-white opacity-30 mx-auto mt-4 md:mt-6"></div>
          </div>
          <div className="text-center text-white text-lg opacity-70">
            Loading visualizations...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8 md:mb-16 text-center">
          <h2
            className={`text-4xl md:text-6xl lg:text-7xl font-light text-white mb-3 md:mb-4 tracking-wide transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            Data Visualizations
          </h2>
          <p
            className={`text-white text-base md:text-lg lg:text-xl font-light opacity-70 transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Interactive insights from admissions data
          </p>
          <div
            className={`w-24 md:w-32 h-1 bg-white opacity-30 mx-auto mt-4 md:mt-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'scale-x-100' : 'scale-x-0'
            }`}
          ></div>
        </div>

        <div
          className={`mb-8 transition-all duration-1000 delay-400 text-center text-sm md:text-base text-yellow-300/80 space-y-1 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p>* Statistics may not be accurate since 2026 decisions are still rolling out.</p>
          <p>* Limited Matric/FSc data is available for 2025.</p>
          <p>* SAT statistics are combined (for both O/A Levels and Matric/FSc students).</p>
        </div>

        <div
          className={`mb-8 md:mb-12 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-sm space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-white text-sm md:text-base font-light opacity-70">Filter by School:</span>
              <button
                onClick={toggleAll}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10 transition-all"
              >
                {selectedSchools.length === schools.length ? 'Deselect All' : 'Select All'}
              </button>
              {schools.map((school) => (
                <button
                  key={school}
                  onClick={() => toggleSchool(school)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border transition-all ${
                    selectedSchools.includes(school)
                      ? 'bg-white bg-opacity-20 border-white border-opacity-50'
                      : 'border-white border-opacity-20 hover:border-opacity-40'
                  } text-white`}
                  style={{
                    backgroundColor: selectedSchools.includes(school)
                      ? schoolColors[school] + '40'
                      : 'transparent',
                  }}
                >
                  {school}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              <span className="text-white text-sm md:text-base font-light opacity-70">Admission Year:</span>
              {['All', '2025', '2026'].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border transition-all ${
                    selectedYear === year
                      ? 'bg-white border-white text-black font-medium'
                      : 'border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <span className="text-white text-sm md:text-base font-light opacity-70">System:</span>
              {['O/A-Levels', 'Matric/FSc'].map(system => (
                <button
                  key={system}
                  onClick={() => setEducationSystem(system)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-lg border transition-all ${
                    educationSystem === system
                      ? 'bg-white border-white text-black font-medium'
                      : 'border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="border border-white border-opacity-10 rounded-xl md:rounded-2xl p-6 md:p-8 backdrop-blur-sm text-center stat-card">
            <div className="text-white text-sm md:text-base uppercase tracking-widest opacity-50 mb-2 md:mb-3">
              Average SAT Score
            </div>
            <div className="text-white text-4xl md:text-5xl lg:text-6xl font-extralight">{avgSAT}</div>
          </div>
          
          {educationSystem === 'O/A-Levels' ? (
            <>
              <div className="border border-white border-opacity-10 rounded-xl md:rounded-2xl p-6 md:p-8 backdrop-blur-sm text-center stat-card">
                <div className="text-white text-sm md:text-base uppercase tracking-widest opacity-50 mb-2 md:mb-3">
                  Average O Levels Points
                </div>
                <div className="text-white text-4xl md:text-5xl lg:text-6xl font-extralight">{showGrades ? estimateGrades(avgOLevels) : avgOLevels}
                  {showGrades && <div className="text-white/40 text-[10px] md:text-sm mt-2">{avgOLevels} pts</div>}</div>
              </div>
              <div className="border border-white border-opacity-10 rounded-xl md:rounded-2xl p-6 md:p-8 backdrop-blur-sm text-center stat-card">
                <div className="text-white text-sm md:text-base uppercase tracking-widest opacity-50 mb-2 md:mb-3">
                  Average AS Levels Points
                </div>
                <div className="text-white text-4xl md:text-5xl lg:text-6xl font-extralight">{showGrades ? estimateGrades(avgASLevels, true) : avgASLevels}
                  {showGrades && <div className="text-white/40 text-[10px] md:text-sm mt-2">{avgASLevels} pts</div>}</div>
              </div>
            </>
          ) : (
            <>
              <div className="border border-white border-opacity-10 rounded-xl md:rounded-2xl p-6 md:p-8 backdrop-blur-sm text-center stat-card">
                <div className="text-white text-sm md:text-base uppercase tracking-widest opacity-50 mb-2 md:mb-3">
                  Average Matric Percentage
                </div>
                <div className="text-white text-4xl md:text-5xl lg:text-6xl font-extralight">{avgMatric}%</div>
              </div>
              <div className="border border-white border-opacity-10 rounded-xl md:rounded-2xl p-6 md:p-8 backdrop-blur-sm text-center stat-card">
                <div className="text-white text-sm md:text-base uppercase tracking-widest opacity-50 mb-2 md:mb-3">
                  Average FSc Percentage
                </div>
                <div className="text-white text-4xl md:text-5xl lg:text-6xl font-extralight">{avgFSc}%</div>
              </div>
            </>
          )}
        </div>


        <div className="space-y-8 md:space-y-12">

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6`}>

            <div
              className={`border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-1000 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
                SAT Scores Box & Whisker
              </h3>
              <div className="h-64 md:h-80 lg:h-96">
                <Chart type="boxplot" data={satBoxData} options={satBoxOptions} />
              </div>
            </div>


            <div
              className={`border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-1000 delay-900 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
                {educationSystem === 'O/A-Levels' ? 'O Levels Box & Whisker' : 'Matric Box & Whisker'}
              </h3>
              <div className="h-64 md:h-80 lg:h-96">
                <Chart type="boxplot" data={oLevelsBoxData} options={oLevelsBoxOptions} />
              </div>
            </div>

            {educationSystem === 'Matric/FSc' && (
              <div
                className={`border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-1000 delay-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
                  FSc Box & Whisker
                </h3>
                <div className="h-64 md:h-80 lg:h-96">
                  <Chart type="boxplot" data={fscBoxData} options={oLevelsBoxOptions} />
                </div>
              </div>
            )}
            
            {educationSystem === 'O/A-Levels' && (
              <div
                className={`border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-1000 delay-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
                  AS Levels Box & Whisker
                </h3>
                <div className="h-64 md:h-80 lg:h-96">
                  <Chart type="boxplot" data={asLevelsBoxData} options={asLevelsBoxOptions} />
                </div>
              </div>
            )}
          </div>


          <div
            className={`border border-white border-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-sm transition-all duration-1000 delay-1100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
              {educationSystem === 'O/A-Levels' ? 'SAT vs O Levels Correlation' : 'SAT vs Matric Correlation'}
            </h3>

            <div className="h-64 md:h-80 lg:h-96 mb-12">
              <Scatter 
                data={educationSystem === 'O/A-Levels' ? oLevelsScatterData : matricScatterData} 
                options={educationSystem === 'O/A-Levels' ? getScatterOptions('O Levels', 'O Levels Points') : getScatterOptions('Matric %', 'Matric (%)')} 
              />
            </div>

            {educationSystem === 'O/A-Levels' && (
              <>
                <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
                  SAT vs AS Levels Correlation
                </h3>
                <div className="h-64 md:h-80 lg:h-96 mb-12">
                  <Scatter data={asLevelsScatterData} options={getScatterOptions('AS Levels', 'AS Levels Points')} />
                </div>
              </>
            )}

            {educationSystem !== 'O/A-Levels' && (
              <>
                <h3 className="text-2xl md:text-3xl font-extralight text-white mb-4 md:mb-6 text-center">
                  SAT vs FSc Correlation
                </h3>
                <div className="h-64 md:h-80 lg:h-96 mb-12">
                  <Scatter data={fscScatterData} options={getScatterOptions('FSc %', 'FSc (%)')} />
                </div>
              </>
            )}

            <div className="mb-6 p-4 md:p-6 border border-white border-opacity-20 rounded-lg bg-black bg-opacity-30">
              <h4 className="text-lg md:text-xl font-light text-white mb-4">Predict Your Admission Chances</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                <div>
                  <label className="block text-white text-sm mb-2 opacity-80">SAT Score</label>
                  <input
                    type="number"
                    value={userSAT}
                    onChange={(e) => setUserSAT(e.target.value)}
                    className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                  />
                </div>

                {educationSystem === 'O/A-Levels' && (
                  <div>
                    <label className="block text-white text-sm mb-2 opacity-80">O Levels Input Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setInputMode('points')}
                        className={`flex-1 px-3 py-2 rounded text-sm transition-all ${
                          inputMode === 'points'
                            ? 'bg-white text-black'
                            : 'border border-white border-opacity-20 hover:border-opacity-40 text-white'
                        }`}
                      >
                        Points
                      </button>
                      <button
                        onClick={() => setInputMode('grades')}
                        className={`flex-1 px-3 py-2 rounded text-sm transition-all ${
                          inputMode === 'grades'
                            ? 'bg-white text-black'
                            : 'border border-white border-opacity-20 hover:border-opacity-40 text-white'
                        }`}
                      >
                        A*/A/a/b Grades
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {educationSystem === 'Matric/FSc' ? (
                  <>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">Matric Percentage</label>
                      <input
                        type="number"
                        step="0.01"
                        max="100"
                        value={userMatric}
                        onChange={(e) => setUserMatric(e.target.value)}
                        placeholder="e.g. 92.5"
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">FSc / HSSC1 Percentage (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        max="100"
                        value={userFSc}
                        onChange={(e) => setUserFSc(e.target.value)}
                        placeholder="e.g. 88.0"
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                  </>
                ) : inputMode === 'points' ? (
                  <>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">O Levels Points</label>
                      <input
                        type="number"
                        value={userOLevels}
                        onChange={(e) => setUserOLevels(e.target.value)}
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">AS Levels Points (Optional)</label>
                      <input
                        type="number"
                        value={userASLevels}
                        onChange={(e) => setUserASLevels(e.target.value)}
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">O Levels: Number of A*s</label>
                      <input
                        type="number"
                        value={userAStars}
                        onChange={(e) => setUserAStars(e.target.value)}
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">O Levels: Number of As</label>
                      <input
                        type="number"
                        value={userAs}
                        onChange={(e) => setUserAs(e.target.value)}
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">AS Levels: Number of 'a's (Optional)</label>
                      <input
                        type="number"
                        value={userSmallAs}
                        onChange={(e) => setUserSmallAs(e.target.value)}
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2 opacity-80">AS Levels: Number of 'b's (Optional)</label>
                      <input
                        type="number"
                        value={userSmallBs}
                        onChange={(e) => setUserSmallBs(e.target.value)}
                        className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                      />
                    </div>
                  </>
                )}


                <div className={educationSystem === 'O/A-Levels' && inputMode === 'grades' ? 'md:col-span-2' : ''}>
                  <label className="block text-white text-sm mb-2 opacity-80">Desired School (Optional)</label>
                  <select
                    value={desiredSchool}
                    onChange={(e) => setDesiredSchool(e.target.value)}
                    className="w-full px-3 py-2 bg-black bg-opacity-50 border border-white border-opacity-30 rounded text-white focus:outline-none focus:border-opacity-60"
                  >
                    <option value="">Any School</option>
                    {schools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={predictSchool}
                className="w-full md:w-auto px-6 py-2 bg-white text-black border border-white rounded hover:bg-opacity-90 transition-all font-medium"
              >
                Predict My Chances
              </button>


              {prediction && (
                <div className="mt-4 p-4 border border-white border-opacity-50 rounded bg-black">
                  {prediction.error ? (
                    <p className="text-red-400">{prediction.error}</p>
                  ) : (
                    <>
                      <p className="text-white text-lg font-light mb-2">
                        <span className="font-normal">Prediction:</span> {prediction.result}
                      </p>
                      <p className="text-white text-sm opacity-80 mb-3">{prediction.message}</p>
                      <p className="text-white text-xs opacity-60 italic">
                        ⓘ Take this as an estimate only. Predictions may not be accurate and should not be the sole basis for decision-making.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
