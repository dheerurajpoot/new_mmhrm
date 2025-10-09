"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Cake,
	Gift,
	Calendar,
	Star,
	Sparkles,
	ChevronDown,
	ChevronRight,
	Users,
	Heart,
	PartyPopper,
	Clock,
	Zap,
	TrendingUp,
} from "lucide-react";


interface Employee {
	id: string;
	full_name: string;
	email: string;
	department: string;
	position: string;
	profile_photo?: string;
	birth_date?: string;
}

interface BirthdayEmployee extends Employee {
	daysUntilBirthday: number;
	birthdayMonth: string;
	birthdayDay: number;
	age: number;
	monthNumber: number;
}

interface MonthGroup {
	month: string;
	monthNumber: number;
	employees: BirthdayEmployee[];
	isCurrentMonth: boolean;
}

export function UpcomingBirthdays({
	showAllMonths = false,
	maxEmployees = 10,
	title = "Birthday Celebrations",
	description = "Celebrate your amazing colleagues",
	sectionData,
	horizontal = false,
}: {
	showAllMonths?: boolean;
	maxEmployees?: number;
	title?: string;
	description?: string;
	sectionData?: any;
	horizontal?: boolean;
}) {
	const [upcomingBirthdays, setUpcomingBirthdays] = useState<
		BirthdayEmployee[]
	>([]);
	const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedMonths, setExpandedMonths] = useState<Set<number>>(
		new Set()
	);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

	// Horizontal scroll helpers (mouse drag + wheel)
	const horizontalRef = useRef<HTMLDivElement | null>(null);
	const [isDragDown, setIsDragDown] = useState(false);
	const [dragStartX, setDragStartX] = useState(0);
	const [dragScrollLeft, setDragScrollLeft] = useState(0);

	const onHWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		const el = horizontalRef.current;
		if (!el) return;
		if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			e.preventDefault();
			el.scrollLeft += e.deltaY;
		}
	};

	const onHMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		const el = horizontalRef.current;
		if (!el) return;
		setIsDragDown(true);
		setDragStartX(e.pageX - el.offsetLeft);
		setDragScrollLeft(el.scrollLeft);
		el.classList.add("cursor-grabbing");
	};

	const onHMouseLeave = () => {
		setIsDragDown(false);
		horizontalRef.current?.classList.remove("cursor-grabbing");
	};

	const onHMouseUp = () => {
		setIsDragDown(false);
		horizontalRef.current?.classList.remove("cursor-grabbing");
	};

	const onHMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragDown) return;
		e.preventDefault();
		const el = horizontalRef.current;
		if (!el) return;
		const x = e.pageX - el.offsetLeft;
		const walk = x - dragStartX;
		el.scrollLeft = dragScrollLeft - walk;
	};

	useEffect(() => {
		if (sectionData?.upcomingBirthdays) {
			// Use section data if available, but ensure proper birthday calculation
			const processedBirthdays = sectionData.upcomingBirthdays.map((emp: any) => {
				// Ensure daysUntilBirthday is properly calculated
				if (emp.birth_date && (!emp.daysUntilBirthday || emp.daysUntilBirthday === undefined)) {
					const birthDate = new Date(emp.birth_date);
					const today = new Date();
					const currentYear = today.getFullYear();

					let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
					if (thisYearBirthday < today) {
						thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
					}

					const daysUntilBirthday = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

					return {
						...emp,
						daysUntilBirthday,
						birthdayMonth: birthDate.toLocaleString('default', { month: 'long' }),
						birthdayDay: birthDate.getDate(),
						age: currentYear - birthDate.getFullYear()
					};
				}
				return emp;
			})
				.sort((a: any, b: any) => a.daysUntilBirthday - b.daysUntilBirthday); // Sort by closest birthday

			setUpcomingBirthdays(processedBirthdays);
			setIsLoading(false);
		} else {
			// Fallback to original data fetching
			fetchUpcomingBirthdays();
		}
	}, [sectionData]);

	const fetchUpcomingBirthdays = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/employee/search");

			if (response.ok) {
				const employees: Employee[] = await response.json();

				const today = new Date();
				const currentYear = today.getFullYear();
				const currentMonth = today.getMonth();

				// Calculate upcoming birthdays
				const birthdayData: BirthdayEmployee[] = employees
					.filter((emp) => emp.birth_date) // Only employees with birth dates
					.map((emp) => {
						const birthDate = new Date(emp.birth_date!);

						if (isNaN(birthDate.getTime())) {
							return null;
						}

						const birthMonth = birthDate.getMonth();
						const birthDay = birthDate.getDate();

						// Calculate this year's birthday
						let thisYearBirthday = new Date(
							currentYear,
							birthMonth,
							birthDay
						);

						// If birthday has passed this year, use next year's date
						if (thisYearBirthday < today) {
							thisYearBirthday = new Date(
								currentYear + 1,
								birthMonth,
								birthDay
							);
						}

						const daysUntilBirthday = Math.ceil(
							(thisYearBirthday.getTime() - today.getTime()) /
							(1000 * 60 * 60 * 24)
						);

						const age = currentYear - birthDate.getFullYear();
						const monthNames = [
							"January",
							"February",
							"March",
							"April",
							"May",
							"June",
							"July",
							"August",
							"September",
							"October",
							"November",
							"December",
						];

						return {
							...emp,
							daysUntilBirthday,
							birthdayMonth: monthNames[birthMonth],
							birthdayDay: birthDay,
							age:
								thisYearBirthday.getFullYear() === currentYear
									? age
									: age + 1,
							monthNumber: birthMonth,
						};
					})
					.filter((item): item is BirthdayEmployee => item !== null) // Remove null entries
					.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday); // Sort by closest birthday

				setUpcomingBirthdays(birthdayData);

				// Group by month
				const groupedByMonth: { [key: number]: BirthdayEmployee[] } =
					{};
				birthdayData.forEach((emp) => {
					if (!groupedByMonth[emp.monthNumber]) {
						groupedByMonth[emp.monthNumber] = [];
					}
					groupedByMonth[emp.monthNumber].push(emp);
				});

				// Create month groups
				const monthNames = [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December",
				];

				const groups: MonthGroup[] = Object.entries(groupedByMonth)
					.map(([monthNum, employees]) => ({
						month: monthNames[parseInt(monthNum)],
						monthNumber: parseInt(monthNum),
						employees: employees.sort(
							(a, b) => a.birthdayDay - b.birthdayDay
						),
						isCurrentMonth: parseInt(monthNum) === currentMonth,
					}))
					.sort((a, b) => {
						// Current month first, then upcoming months
						if (a.isCurrentMonth && !b.isCurrentMonth) return -1;
						if (!a.isCurrentMonth && b.isCurrentMonth) return 1;
						return a.monthNumber - b.monthNumber;
					});

				setMonthGroups(groups);

				// Auto-expand current month and next month
				const nextMonth = (currentMonth + 1) % 12;
				setExpandedMonths(new Set([currentMonth, nextMonth]));
			} else {
				console.error("Failed to fetch employees for birthday data");
			}
		} catch (error) {
			console.error("Error fetching upcoming birthdays:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getBirthdayBadgeColor = (daysUntil: number) => {
		if (daysUntil === 0) return "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse";
		if (daysUntil === 1) return "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md";
		if (daysUntil <= 7) return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm";
		if (daysUntil <= 14) return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white";
		if (daysUntil <= 30) return "bg-gradient-to-r from-purple-400 to-pink-400 text-white";
		return "bg-gradient-to-r from-slate-400 to-slate-500 text-white";
	};

	const getBirthdayText = (daysUntil: number) => {
		if (daysUntil === undefined || daysUntil === null || isNaN(daysUntil)) {
			return "Unknown";
		}

		if (daysUntil === 0) return "🎉 Today!";
		if (daysUntil === 1) return "🎂 Tomorrow";
		if (daysUntil <= 7) return `${daysUntil} days`;
		if (daysUntil <= 30) return `${daysUntil} days`;
		return `${daysUntil} days`;
	};

	const getPriorityLevel = (daysUntil: number) => {
		if (daysUntil === 0) return "urgent";
		if (daysUntil <= 3) return "high";
		if (daysUntil <= 7) return "medium";
		if (daysUntil <= 30) return "low";
		return "future";
	};

	const toggleMonth = (monthNumber: number) => {
		const newExpanded = new Set(expandedMonths);
		if (newExpanded.has(monthNumber)) {
			newExpanded.delete(monthNumber);
		} else {
			newExpanded.add(monthNumber);
		}
		setExpandedMonths(newExpanded);
	};

	const renderEmployeeCard = (
		employee: BirthdayEmployee,
		isNext: boolean = false,
		viewMode: 'grid' | 'list' = 'list'
	) => {
		const priority = getPriorityLevel(employee.daysUntilBirthday);
		const isToday = employee.daysUntilBirthday === 0;
		const isTomorrow = employee.daysUntilBirthday === 1;

		if (viewMode === 'grid') {
			return (
				<div
					key={employee.id}
					className={`group relative bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 border hover:shadow-xl hover:scale-105 ${isToday ? 'border-red-300 shadow-lg ring-2 ring-red-100' :
						isTomorrow ? 'border-orange-300 shadow-md ring-1 ring-orange-100' :
							'border-pink-200/50 hover:border-pink-300'
						}`}>
					{/* Special decorations */}
					{isToday && (
						<div className='absolute -top-2 -right-2 z-10'>
							<div className='relative'>
								<PartyPopper className='w-6 h-6 text-red-500 fill-current animate-bounce' />
								<Sparkles className='w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse' />
							</div>
						</div>
					)}
					{isTomorrow && (
						<div className='absolute -top-1 -right-1 z-10'>
							<Star className='w-5 h-5 text-orange-500 fill-current animate-pulse' />
						</div>
					)}

					{/* Avatar with special effects */}
					<div className='flex flex-col items-center space-y-3'>
						<div className='relative'>
							<Avatar className={`w-16 h-16 ring-4 ${isToday ? 'ring-red-200 animate-pulse' :
								isTomorrow ? 'ring-orange-200' :
									'ring-pink-100 group-hover:ring-pink-200'
								} transition-all duration-300`}>
								<AvatarImage
									src={employee.profile_photo}
									alt={employee.full_name}
									className="object-cover"
								/>
								<AvatarFallback className={`text-lg font-bold ${isToday ? 'bg-gradient-to-br from-red-500 to-pink-500' :
									isTomorrow ? 'bg-gradient-to-br from-orange-500 to-red-500' :
										'bg-gradient-to-br from-pink-400 to-purple-400'
									} text-white`}>
									{employee.full_name?.charAt(0) || "E"}
								</AvatarFallback>
							</Avatar>
							{(isToday || isTomorrow) && (
								<div className='absolute -bottom-1 -right-1'>
									<div className={`w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
										}`}>
										<Cake className='w-3 h-3 text-white' />
									</div>
								</div>
							)}
						</div>

						{/* Employee info */}
						<div className='text-center space-y-2'>
							<h4 className={`font-bold text-gray-900 truncate ${isToday ? 'text-lg' : 'text-sm'
								}`}>
								{employee.full_name}
							</h4>

							<div className='flex items-center justify-center space-x-1 text-xs text-gray-600'>
								<Calendar className='w-3 h-3' />
								<span className={`${isToday ? 'font-bold text-red-700' :
									isTomorrow ? 'font-semibold text-orange-700' :
										''
									}`}>
									{employee.birthdayMonth} {employee.birthdayDay}
								</span>
							</div>

							<div className='flex items-center justify-center space-x-1 text-xs text-gray-500'>
								<Heart className='w-3 h-3' />
								<span>Age {employee.age}</span>
							</div>
						</div>

						{/* Badge */}
						<Badge className={`text-xs font-semibold ${getBirthdayBadgeColor(employee.daysUntilBirthday)}`}>
							{getBirthdayText(employee.daysUntilBirthday)}
						</Badge>
					</div>
				</div>
			);
		}

		// List view
		return (
			<div
				key={employee.id}
				className={`group relative flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 border hover:shadow-lg ${isToday ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-md' :
					isTomorrow ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-sm' :
						'bg-gradient-to-r from-white to-rose-50/30 border-pink-200/50 hover:border-pink-300'
					}`}>
				{/* Special decorations */}
				{isToday && (
					<div className='absolute -top-2 -right-2 z-10'>
						<div className='relative'>
							<PartyPopper className='w-6 h-6 text-red-500 fill-current animate-bounce' />
							<Sparkles className='w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse' />
						</div>
					</div>
				)}
				{isTomorrow && (
					<div className='absolute -top-1 -right-1 z-10'>
						<Star className='w-5 h-5 text-orange-500 fill-current animate-pulse' />
					</div>
				)}

				{/* Avatar */}
				<div className='relative flex-shrink-0'>
					<Avatar className={`w-14 h-14 ring-3 ${isToday ? 'ring-red-200 animate-pulse' :
						isTomorrow ? 'ring-orange-200' :
							'ring-pink-100 group-hover:ring-pink-200'
						} transition-all duration-300`}>
						<AvatarImage
							src={employee.profile_photo}
							alt={employee.full_name}
							className="object-cover"
						/>
						<AvatarFallback className={`text-base font-bold ${isToday ? 'bg-gradient-to-br from-red-500 to-pink-500' :
							isTomorrow ? 'bg-gradient-to-br from-orange-500 to-red-500' :
								'bg-gradient-to-br from-pink-400 to-purple-400'
							} text-white`}>
							{employee.full_name?.charAt(0) || "E"}
						</AvatarFallback>
					</Avatar>
					{(isToday || isTomorrow) && (
						<div className='absolute -bottom-1 -right-1'>
							<div className={`w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
								}`}>
								<Cake className='w-3 h-3 text-white' />
							</div>
						</div>
					)}
				</div>

				{/* Employee info */}
				<div className='flex-1 min-w-0 space-y-2'>
					<div className='flex items-center justify-between'>
						<h4 className={`font-bold text-gray-900 truncate ${isToday ? 'text-lg' : 'text-base'
							}`}>
							{employee.full_name}
						</h4>
						<Badge className={`text-xs font-semibold ${getBirthdayBadgeColor(employee.daysUntilBirthday)}`}>
							{getBirthdayText(employee.daysUntilBirthday)}
						</Badge>
					</div>

					<div className='flex items-center space-x-4 text-sm text-gray-600'>
						<div className='flex items-center space-x-1'>
							<Calendar className='w-4 h-4' />
							<span className={`${isToday ? 'font-bold text-red-700' :
								isTomorrow ? 'font-semibold text-orange-700' :
									''
								}`}>
								{employee.birthdayMonth} {employee.birthdayDay}
							</span>
						</div>
						<div className='flex items-center space-x-1'>
							<Heart className='w-4 h-4' />
							<span>Age {employee.age}</span>
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Redesigned horizontal birthday card renderer
	const renderHorizontalItem = (employee: BirthdayEmployee) => {
		const isToday = employee.daysUntilBirthday === 0;
		const isTomorrow = employee.daysUntilBirthday === 1;

		return (
			<div
				key={employee.id}
				className={`group shrink-0 w-[320px] h-36 rounded-2xl border transition-all duration-300 overflow-hidden relative cursor-pointer hover:shadow-xl hover:scale-105 ${isToday
						? 'bg-gradient-to-br from-red-50 via-pink-50/50 to-rose-50/30 border-red-200/60 shadow-lg ring-2 ring-red-100'
						: isTomorrow
							? 'bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50/30 border-orange-200/60 shadow-md ring-1 ring-orange-100'
							: 'bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 border-rose-200/60 hover:border-rose-300'
					}`}
			>
				{/* Special decorations for today/tomorrow */}
				{isToday && (
					<div className='absolute -top-2 -right-2 z-10'>
						<div className='relative'>
							<PartyPopper className='w-6 h-6 text-red-500 fill-current animate-bounce' />
							<Sparkles className='w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse' />
						</div>
					</div>
				)}
				{isTomorrow && (
					<div className='absolute -top-1 -right-1 z-10'>
						<Star className='w-5 h-5 text-orange-500 fill-current animate-pulse' />
					</div>
				)}

				{/* Card Content */}
				<div className="relative h-full flex">
					{/* Left Section - Profile Picture (30%) */}
					<div className="w-[30%] h-full flex items-center justify-center p-3">
						<div className="relative">
							<Avatar className={`w-16 h-16 ring-4 ${isToday
									? 'ring-red-200 animate-pulse'
									: isTomorrow
										? 'ring-orange-200'
										: 'ring-rose-100 group-hover:ring-rose-200'
								} transition-all duration-300`}>
								<AvatarImage
									src={employee.profile_photo}
									alt={employee.full_name}
									className="object-cover"
								/>
								<AvatarFallback className={`text-lg font-bold ${isToday
										? 'bg-gradient-to-br from-red-500 to-pink-500'
										: isTomorrow
											? 'bg-gradient-to-br from-orange-500 to-red-500'
											: 'bg-gradient-to-br from-rose-400 to-purple-400'
									} text-white`}>
									{employee.full_name?.charAt(0) || "E"}
								</AvatarFallback>
							</Avatar>
							{(isToday || isTomorrow) && (
								<div className='absolute -bottom-1 -right-1'>
									<div className={`w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
										}`}>
										<Cake className='w-3 h-3 text-white' />
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Right Section - Employee Information (70%) */}
					<div className="w-[70%] h-full p-4 flex flex-col justify-center space-y-3">
						{/* Top Section - Name and Days Badge */}
						<div className="flex items-center justify-between">
							<h3 className={`font-bold text-gray-800 group-hover:text-rose-600 transition-colors duration-200 line-clamp-2 leading-tight ${isToday ? 'text-lg' : 'text-sm'
								}`}>
								{employee.full_name}
							</h3>
							<Badge className={`text-[10px] px-2 py-1 font-semibold shadow-md ${getBirthdayBadgeColor(employee.daysUntilBirthday)}`}>
								{getBirthdayText(employee.daysUntilBirthday)}
							</Badge>
						</div>

						{/* Bottom Section - Date */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-1 bg-rose-100 rounded-md">
									<Calendar className="w-3 h-3 text-rose-600" />
								</div>
								<span className={`text-xs font-semibold ${isToday
										? 'text-red-700'
										: isTomorrow
											? 'text-orange-700'
											: 'text-gray-700'
									}`}>
									{employee.birthdayMonth} {employee.birthdayDay}
								</span>
							</div>
							<Badge className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200">
								Birthday
							</Badge>
						</div>
					</div>
				</div>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className='bg-gradient-to-br from-rose-50 via-white to-pink-50/30 backdrop-blur-xl rounded-3xl border border-rose-200/50 p-6 shadow-xl'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg'>
							<Cake className='w-6 h-6 text-white' />
						</div>
						<div>
							<h3 className='text-xl font-bold text-rose-900'>
								{title}
							</h3>
							<p className='text-sm text-rose-600 font-medium'>
								{description}
							</p>
						</div>
					</div>
				</div>
				<div className='space-y-4'>
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={index}
							className='flex items-center space-x-4 p-4 rounded-2xl bg-white/50 animate-pulse'>
							<div className='w-14 h-14 bg-rose-200 rounded-full'></div>
							<div className='flex-1 space-y-2'>
								<div className='w-32 h-4 bg-rose-200 rounded'></div>
								<div className='w-24 h-3 bg-rose-200 rounded'></div>
							</div>
							<div className='w-16 h-6 bg-rose-200 rounded-full'></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (upcomingBirthdays.length === 0) {
		return (
			<div className='bg-gradient-to-br from-rose-50 via-white to-pink-50/30 backdrop-blur-xl rounded-3xl border border-rose-200/50 p-6 shadow-xl'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg'>
							<Cake className='w-6 h-6 text-white' />
						</div>
						<div>
							<h3 className='text-xl font-bold text-rose-900'>
								{title}
							</h3>
							<p className='text-sm text-rose-600 font-medium'>
								{description}
							</p>
						</div>
					</div>
				</div>
				<div className='text-center py-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border-2 border-dashed border-rose-200'>
					<div className='w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
						<Gift className='w-8 h-8 text-rose-500' />
					</div>
					<h3 className='text-lg font-semibold text-rose-800 mb-2'>
						No Upcoming Birthdays
					</h3>
					<p className='text-rose-600 max-w-sm mx-auto'>
						Birthday celebrations will appear here as they approach. Check back soon!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-gradient-to-br from-rose-50 via-white to-pink-50/30 backdrop-blur-xl rounded-3xl   hover:transition-all duration-500'>
			{/* Content */}
			{showAllMonths ? (
				<div className='space-y-4'>
					{monthGroups.map((group) => (
						<Collapsible
							key={group.monthNumber}
							open={expandedMonths.has(group.monthNumber)}
							onOpenChange={() => toggleMonth(group.monthNumber)}>
							<CollapsibleTrigger asChild>
								<Button
									variant='ghost'
									className='w-full justify-between p-4 h-auto hover:bg-rose-50/50 rounded-2xl border border-rose-200/30'>
									<div className='flex items-center space-x-4'>
										<div className={`w-10 h-10 rounded-full flex items-center justify-center ${group.isCurrentMonth
											? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg"
											: "bg-rose-100 text-rose-600"
											}`}>
											<Cake className='w-5 h-5' />
										</div>
										<div className='text-left'>
											<h3 className={`font-bold ${group.isCurrentMonth
												? "text-rose-700"
												: "text-gray-900"
												}`}>
												{group.month}
											</h3>
											<p className='text-sm text-gray-600'>
												{group.employees.length} birthday{group.employees.length !== 1 ? "s" : ""}
											</p>
										</div>
									</div>
									{expandedMonths.has(group.monthNumber) ? (
										<ChevronDown className='w-5 h-5 text-rose-600' />
									) : (
										<ChevronRight className='w-5 h-5 text-rose-600' />
									)}
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className='mt-4'>
								<div className={`${viewMode === 'grid'
									? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
									: 'space-y-3'
									}`}>
									{group.employees.map((employee, index) =>
										renderEmployeeCard(
											employee,
											index === 0 && group.isCurrentMonth,
											viewMode
										)
									)}
								</div>
							</CollapsibleContent>
						</Collapsible>
					))}
				</div>
			) : (
				horizontal ? (
					<div
						ref={horizontalRef}
						onWheel={onHWheel}
						onMouseDown={onHMouseDown}
						onMouseLeave={onHMouseLeave}
						onMouseUp={onHMouseUp}
						onMouseMove={onHMouseMove}
						className='h-40 overflow-x-auto overflow-y-hidden p-2 flex gap-4 touch-pan-x select-none cursor-grab'
					>
						{upcomingBirthdays.slice(0, maxEmployees).map((employee) => renderHorizontalItem(employee))}
					</div>
				) : (
					<div className={`${viewMode === 'grid'
						? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
						: 'space-y-3'
						} max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent hover:scrollbar-thumb-rose-300`}>
						{upcomingBirthdays
							.slice(0, maxEmployees)
							.map((employee, index) =>
								renderEmployeeCard(employee, index === 0, viewMode)
							)}
					</div>
				)
			)}

			{/* Footer with quick stats */}
			<div className='mt-4 pt-3 border-t border-rose-200/50'>
				<div className='flex items-center justify-between text-xs text-rose-600'>
					<div className='flex items-center gap-4'>
						{upcomingBirthdays.filter(emp => emp.daysUntilBirthday === 0).length > 0 && (
							<div className='flex items-center gap-1'>
								<PartyPopper className='w-4 h-4 text-red-500' />
								<span className='font-semibold text-red-600'>
									{upcomingBirthdays.filter(emp => emp.daysUntilBirthday === 0).length} Today
								</span>
							</div>
						)}
						{upcomingBirthdays.filter(emp => emp.daysUntilBirthday === 1).length > 0 && (
							<div className='flex items-center gap-1'>
								<Clock className='w-4 h-4 text-orange-500' />
								<span className='font-semibold text-orange-600'>
									{upcomingBirthdays.filter(emp => emp.daysUntilBirthday === 1).length} Tomorrow
								</span>
							</div>
						)}
						<div className='flex items-center gap-1'>
							<TrendingUp className='w-4 h-4' />
							<span className='font-medium'>
								{upcomingBirthdays.filter(emp => emp.daysUntilBirthday <= 7).length} This Week
							</span>
						</div>
					</div>
					<span className='text-rose-500'>
						{new Date().toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}
