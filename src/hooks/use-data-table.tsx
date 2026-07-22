import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant/data-table-constant";
import { useState } from "react";
import useDebounce from "./use-debounce";


export default function useDataTable() {
const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
const [currentLimit, setCurrentLimit] = useState(DEFAULT_LIMIT);
const [currentSearch, setCurrentSearch] = useState("");
const debounce = useDebounce();

const handleChangePage = (page: number) => {  setCurrentPage(page);
};

const handleChangeLimit = (limit: number) => {
  setCurrentLimit(limit);
  setCurrentPage(DEFAULT_PAGE); // Reset to first page when limit changes
};

const handleChangeSearch = (search: string) => {
  debounce(() => {
    setCurrentSearch(search);
    setCurrentPage(DEFAULT_PAGE); 
  }, 500); 
}



  return {
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
    currentSearch,
  };
}