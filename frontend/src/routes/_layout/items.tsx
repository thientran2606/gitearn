import {
  Container,
  Flex,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { Suspense, useMemo, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ItemsService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

export const Route = createFileRoute("/_layout/items")({
  component: Items,
})

interface ItemsTableBodyProps {
  searchTerm: string
}

function ItemsTableBody({ searchTerm }: ItemsTableBodyProps) {
  const { data: items } = useSuspenseQuery({
    queryKey: ["items"],
    queryFn: () => ItemsService.readItems({}),
  })

  const filteredItems = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase()

    if (!searchValue) {
      return items.data
    }

    return items.data.filter((item) =>
      [item.id, item.title, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue)),
    )
  }, [items.data, searchTerm])

  return (
    <Tbody>
      {filteredItems.map((item) => (
        <Tr key={item.id}>
          <Td>{item.id}</Td>
          <Td>{item.title}</Td>
          <Td color={!item.description ? "ui.dim" : "inherit"}>
            {item.description || "N/A"}
          </Td>
          <Td>
            <ActionsMenu type={"Item"} value={item} />
          </Td>
        </Tr>
      ))}
      {filteredItems.length === 0 && (
        <Tr>
          <Td colSpan={4}>No items found.</Td>
        </Tr>
      )}
    </Tbody>
  )
}
interface ItemsTableProps {
  searchTerm: string
}

function ItemsTable({ searchTerm }: ItemsTableProps) {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Title</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={4}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(4).fill(null).map((_, index) => (
                      <Td key={index}>
                        <Flex>
                          <Skeleton height="20px" width="20px" />
                        </Flex>
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            }
          >
            <ItemsTableBody searchTerm={searchTerm} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Items() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Items Management
      </Heading>

      <Navbar
        type={"Item"}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <ItemsTable searchTerm={searchTerm} />
    </Container>
  )
}
