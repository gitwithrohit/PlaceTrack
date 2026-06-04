import Sidebar from '../components/Sidebar';

const CodingChallenges = () => {
  const problems = [
    { title: "Reverse a String", task: "Write a function that reverses a string.", input: "\"hello\"" },
    { title: "Palindrome Checker", task: "Check if a string is a palindrome (ignore case).", input: "\"Madam\"" },
    { title: "Maximum Number in Array", task: "Find the largest number in an array.", input: "[4, 9, 1, 7]" },
    { title: "Count Vowels", task: "Count total vowels in a string.", input: "\"programming\"" },
    { title: "Sum of Elements", task: "Return sum of all numbers in array.", input: "[1,2,3,4]" },
    { title: "FizzBuzz Challenge", task: "Print numbers from 1 to N with rules: 3 → Fizz, 5 → Buzz, both → FizzBuzz", input: "5" },
    { title: "Remove Duplicates", task: "Remove duplicate values from array.", input: "[1,2,2,3,4,4]" },
    { title: "Factorial (Recursive)", task: "Return factorial of a number.", input: "5" },
    { title: "Fibonacci Sequence", task: "Return first N Fibonacci numbers.", input: "6" },
    { title: "Anagram Validator", task: "Check if two strings are anagrams.", input: "\"listen\", \"silent\"" },
    { title: "Second Largest Number", task: "Find second largest element.", input: "[10, 5, 8, 20]" },
    { title: "Merge & Sort Arrays", task: "Merge two arrays and sort result.", input: "[3,1], [4,2]" },
    { title: "Word Counter", task: "Count number of words in sentence.", input: "\"Hello world from AI\"" },
    { title: "Missing Number", task: "Find missing number from 1 to N.", input: "[1,2,4,5]" },
    { title: "Two Sum", task: "Return indices of two numbers adding to target.", input: "[2,7,11,15], target=9" },
    { title: "Binary Search", task: "Find index of target in sorted array.", input: "[1,3,5,7], target=5" },
    { title: "Custom Sort", task: "Sort array without built-in functions.", input: "[5,2,8,1]" },
    { title: "Prime Number Check", task: "Check if number is prime.", input: "7" },
    { title: "Array Intersection", task: "Find common elements in two arrays.", input: "[1,2,3], [2,3,4]" },
    { title: "Longest Word", task: "Return longest word in sentence.", input: "\"I love programming\"" },
    { title: "Capitalize Words", task: "Capitalize first letter of each word.", input: "\"hello world\"" },
    { title: "Flatten Nested Array", task: "Convert nested array into flat array.", input: "[1,[2,[3,4]]]" },
    { title: "Frequency Counter", task: "Count frequency of elements.", input: "[1,2,2,3]" },
    { title: "Reverse Integer", task: "Reverse digits of number.", input: "1234" },
    { title: "Even or Odd", task: "Determine if a number is even or odd.", input: "6" },
    { title: "Maximum Difference", task: "Find max difference (larger after smaller).", input: "[2,3,10,6,4,8,1]" },
    { title: "Rotate Array", task: "Rotate array right by k steps.", input: "[1,2,3,4,5], k=2" },
    { title: "Remove Falsy Values", task: "Remove false, null, 0, \"\", undefined.", input: "[0,1,false,2,\"\",3]" },
    { title: "String Compression", task: "Compress string using counts.", input: "\"aabcccccaaa\"" },
    { title: "Longest Unique Substring", task: "Find length of longest substring without repeating characters.", input: "\"abcabcbb\"" }
  ];

  return (
    <div className="bg-[#f8f9f8] dark:bg-[#0f110f] min-h-screen flex transition-colors duration-500">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-[40px] font-semibold text-[#1a1c1a] dark:text-white leading-tight mb-3">Coding Challenges</h1>
          <p className="text-[#5f6368] dark:text-gray-400 text-lg max-w-2xl leading-relaxed">Master your logic with these 30 hand-picked technical problems.</p>
        </header>

        <div className="bg-white dark:bg-[#151715] rounded-[32px] border border-[#e0e0e0] dark:border-white/10 shadow-sm overflow-hidden transition-colors duration-500">
          <div className="p-8 border-b border-[#f0f0f0] dark:border-white/5 bg-[#1a1c1a]/5 dark:bg-white/5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1c1a] dark:bg-white flex items-center justify-center text-white dark:text-[#1a1c1a] shadow-lg shadow-[#1a1c1a]/20">
                <span className="material-symbols-outlined text-[28px]">code_blocks</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#1a1c1a] dark:text-white">Problem Set</h2>
                <p className="text-[#5f6368] dark:text-gray-400 text-sm font-medium">30 Problems to strengthen your algorithmic thinking.</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((item, idx) => (
              <div key={idx} className="group p-6 rounded-2xl border border-[#f0f0f0] dark:border-white/5 hover:border-[#325f3f] dark:hover:border-[#325f3f] hover:bg-[#325f3f]/5 transition-all duration-300 relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#f8f9f8] dark:bg-white/5 border border-[#f0f0f0] dark:border-white/10 flex items-center justify-center text-[13px] font-semibold text-[#325f3f] group-hover:bg-[#325f3f] group-hover:text-white transition-all shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1a1c1a] dark:text-white mb-2 group-hover:text-[#325f3f] transition-colors duration-300 text-[15px]">{item.title}</h4>
                    <p className="text-[13px] text-[#5f6368] dark:text-gray-400 leading-relaxed font-medium mb-3">
                      {item.task}
                    </p>
                    <div className="bg-white/50 dark:bg-black/20 border border-[#f0f0f0] dark:border-white/10 rounded-lg p-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-[#5f6368] dark:text-gray-500 mb-1">Example Input</p>
                      <code className="text-[12px] font-mono text-[#325f3f]">{item.input}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodingChallenges;
