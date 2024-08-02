"use client";

import React from "react";
import { Input } from "./ui/input";
import Image from "next/image";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  iconSrc?: string;
  iconAlt?: string;
  placeholder: string;
}
const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  iconSrc,
  iconAlt,
  placeholder,
}) => {
  return (
    <div className="flex rounded-md border border-dark-500 bg-dark-400">
      <Image
        src="/assets/icons/searchBar.svg"
        height={24}
        width={24}
        alt={iconAlt || "icon"}
        className="ml-2"
      />

      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="searchBar min-w-[200px] xl:min-w-[300px] border-0"
      />
    </div>
  );
};

export default SearchBar;
