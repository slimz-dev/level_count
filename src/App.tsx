import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import {
	EXP_PER_DAY,
	HUYEN_TIEN_EXP,
	HUYEN_TIEN_LAST_LEVEL,
	HUYEN_TIEN_LEVEL,
	KIM_TIEN_EXP,
	KIM_TIEN_LAST_LEVEL,
	KIM_TIEN_lEVEL,
	TIEN_QUAN_EXP,
	TIEN_QUAN_LAST_LEVEL,
	TIEN_QUAN_LEVEL,
} from './constants';

interface FormData {
	name: string;
	ingame: string;
	levelBase: number;
	expBase: number;
	expectedLevel: number;
	expPerDay: number;
}

const App: React.FC = () => {
	const [formData, setFormData] = useState<FormData>({
		name: '',
		ingame: '',
		levelBase: 0,
		expBase: 0,
		expectedLevel: 0,
		expPerDay: 50000,
	});
	const [data, setData] = useState<FormData[]>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]:
				name === 'levelBase' || name === 'expBase' || name === 'expPerDay'
					? Number(value)
					: value,
		});
	};

	const getExpFromRange = (level: number, lastLevel: number, exp: number) => {
		let expLeft, expCurrentLevel, expRequiredCurrentLevel;
		if (formData.levelBase < lastLevel) {
			let alreadyPassed = formData.levelBase - level;
			expCurrentLevel = alreadyPassed * 70 + exp;
		} else {
			expCurrentLevel =
				(formData.levelBase - lastLevel) * 90 + (lastLevel - level) * 70 + exp;
		}
		expRequiredCurrentLevel = expCurrentLevel - formData.expBase;
		expLeft = formData.expPerDay * 30 - expRequiredCurrentLevel;
		return {
			expLeft,
			expCurrentLevel,
		};
	};

	const getExp = () => {
		if (formData.levelBase < KIM_TIEN_lEVEL) {
			return getExpFromRange(HUYEN_TIEN_LEVEL, HUYEN_TIEN_LAST_LEVEL, HUYEN_TIEN_EXP);
		} else {
			if (formData.levelBase < TIEN_QUAN_LEVEL) {
				return getExpFromRange(KIM_TIEN_lEVEL, KIM_TIEN_LAST_LEVEL, KIM_TIEN_EXP);
			}
		}
		return getExpFromRange(TIEN_QUAN_LEVEL, TIEN_QUAN_LAST_LEVEL, TIEN_QUAN_EXP);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.ingame || formData.levelBase <= 0 || formData.expBase <= 0)
			return;
		if (
			formData.levelBase < HUYEN_TIEN_LEVEL ||
			formData.levelBase > TIEN_QUAN_LAST_LEVEL + 100
		) {
			Swal.fire({
				title: 'Error!',
				text: `Range only from lv 756 to lv 1600`,
				icon: 'error',
			});
		} else {
			let expectedLevel = 0;
			let { expLeft, expCurrentLevel } = getExp();
			let i = 1;
			let step = 70;
			let currentLevel = formData.levelBase;
			if (
				(currentLevel + 1 >= HUYEN_TIEN_LAST_LEVEL && currentLevel + 1 < KIM_TIEN_lEVEL) ||
				(currentLevel + 1 >= KIM_TIEN_LAST_LEVEL && currentLevel + 1 < TIEN_QUAN_LEVEL)
			) {
				step = 90;
			}
			do {
				expLeft = expLeft - (expCurrentLevel + step * i);
				if (
					currentLevel + i === HUYEN_TIEN_LAST_LEVEL ||
					currentLevel + i === KIM_TIEN_LAST_LEVEL ||
					currentLevel + i === TIEN_QUAN_LAST_LEVEL
				) {
					currentLevel = currentLevel + i;
					step = 90;
					i = 1;
				} else if (currentLevel + i === KIM_TIEN_lEVEL) {
					expCurrentLevel = KIM_TIEN_EXP;
					step = 70;
					currentLevel = KIM_TIEN_lEVEL;
					i = 1;
				} else if (currentLevel + i === TIEN_QUAN_LEVEL) {
					expCurrentLevel = TIEN_QUAN_EXP;
					step = 70;
					currentLevel = TIEN_QUAN_LEVEL;

					i = 1;
				} else {
					i++;
				}
			} while (expLeft > 0);
			expectedLevel = currentLevel + i - 1;
			const newData = { ...formData, expectedLevel };
			setData([...data, newData]);
			setFormData({
				name: '',
				ingame: '',
				levelBase: 0,
				expBase: 0,
				expectedLevel: 0,
				expPerDay: formData.expPerDay,
			});

			Swal.fire({
				title: 'Success!',
				text: `KPI sau 30 ngày là: ${expectedLevel}`,
				icon: 'success',
			});
		}
	};

	const exportToExcel = () => {
		const ws = XLSX.utils.json_to_sheet(data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
		XLSX.writeFile(wb, 'kpi_ulele.xlsx');
	};

	const handleDelete = (index) => {
		setData((prev) => {
			const newArray = [...prev];
			newArray.splice(index, 1);
			return newArray;
		});
	};

	return (
		<div className="min-h-screen flex-col bg-gradient-to-r from-blue-500 to-teal-500 flex justify-center items-center">
			<div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
				<h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Get KPI</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center ">
						<label className="w-48">Exp per day</label>
						<input
							type="text"
							name="expPerDay"
							placeholder="exp daily"
							value={formData.expPerDay}
							onChange={handleChange}
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div className="flex items-center ">
						<label className="w-48">Name</label>
						<input
							type="text"
							name="name"
							placeholder="Name"
							value={formData.name}
							onChange={handleChange}
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div className="flex items-center ">
						<label className="w-48">Ingame</label>
						<input
							type="text"
							name="ingame"
							placeholder="Ingame"
							value={formData.ingame}
							onChange={handleChange}
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div className="flex items-center ">
						<label className="w-48">Current Level</label>
						<input
							type="text"
							name="levelBase"
							placeholder="Level Base"
							value={formData.levelBase}
							onChange={handleChange}
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<div className="flex items-center ">
						<label className="w-48">Current exp</label>
						<input
							type="text"
							name="expBase"
							placeholder="Exp Base"
							value={formData.expBase}
							onChange={handleChange}
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-all duration-300 ease-in-out"
					>
						Submit
					</button>
				</form>
			</div>
			{data.length > 0 && (
				<div className="mt-6 max-sm:w-full  ">
					<h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
						KPI table
					</h3>
					<div className="w-full overflow-auto">
						<table className=" w-full table-auto border-collapse border border-gray-300 shadow-md">
							<thead>
								<tr className="bg-blue-500 text-white">
									<th className="px-4 py-2 border">ID</th>
									<th className="px-4 py-2 border">Name</th>
									<th className="px-4 py-2 border">Ingame</th>
									<th className="px-4 py-2 border">Level Base</th>
									<th className="px-4 py-2 border">Exp Base</th>
									<th className="px-4 py-2 border">Expected Level</th>
									<th className="px-4 py-2 border">
										<FontAwesomeIcon icon={faTrash} />
									</th>
								</tr>
							</thead>
							<tbody>
								{data.map((item, index) => (
									<tr
										key={index}
										className="text-center border-b hover:bg-gray-100"
									>
										<td className="px-4 py-2">{index + 1}</td>
										<td className="px-4 py-2">{item.name}</td>
										<td className="px-4 py-2">{item.ingame}</td>
										<td className="px-4 py-2">{item.levelBase}</td>
										<td className="px-4 py-2">{item.expBase}</td>
										<td className="px-4 py-2">{item.expectedLevel}</td>
										<td
											onClick={() => handleDelete(index)}
											className="px-4 cursor-pointer py-2 border"
										>
											<FontAwesomeIcon icon={faTrash} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<button
						onClick={exportToExcel}
						className="mt-4 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-all duration-300 ease-in-out w-full"
					>
						Export to Excel
					</button>
				</div>
			)}
		</div>
	);
};

export default App;
