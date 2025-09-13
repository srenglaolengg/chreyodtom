
import React from 'react';
import { Language } from '../types';
import { SCHEDULE_DATA } from '../constants';

interface ScheduleProps {
    language: Language;
}

const Schedule: React.FC<ScheduleProps> = ({ language }) => {
    const schedule = SCHEDULE_DATA[language];
    const headers = {
        en: { time: "Time", activity: "Activity" },
        km: { time: "ពេលវេលា", activity: "សកម្មភាព" }
    };
    const currentHeaders = headers[language];

    return (
        <section id="schedule" className="py-20 bg-amber-50/30">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-bold text-amber-800 ${language === 'km' ? 'font-khmer' : ''}`}>
                        {language === 'km' ? 'កាលវិភាគប្រចាំថ្ងៃ' : 'Daily Schedule'}
                    </h2>
                </div>
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className={`p-4 text-amber-800 font-bold ${language === 'km' ? 'font-khmer' : ''}`}>{currentHeaders.time}</th>
                                <th className={`p-4 text-amber-800 font-bold ${language === 'km' ? 'font-khmer' : ''}`}>{currentHeaders.activity}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((item, index) => (
                                <tr key={index} className="border-t border-amber-200">
                                    <td className={`p-4 font-semibold text-stone-700 ${language === 'km' ? 'font-khmer' : ''}`}>{item.time}</td>
                                    <td className={`p-4 text-stone-600 ${language === 'km' ? 'font-khmer' : ''}`}>{item.activity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default Schedule;
