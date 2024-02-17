---
title: "Slice Notation"
date: 2024-02-16T20:06:16-07:00
draft: false
---

Go's slice notation I feel is often overlooked, as using colons within
brackets ([:]), makes for a powerful way to work with arrays and slices.
We just specify a range of indices and an optional capacity to create a
new slice from an existing array or slice without duplicating any data.

Let's take a closer look at Go's slice notation, emphasizing how slices relate to
their underlying arrays.

---

{{< style "slice_visualizer.css" >}}

<div id="operationLabel">Operation: Full Array</div>
<div id="operationDescription">Displays the full array (slice[:]). No slicing applied.</div>
<div class="color-legend">
    <span class="gray">Underlying Array</span>
    <span class="blue">Slice</span>
    <span class="green">Capacity</span>
</div>
<canvas id="sliceCanvas" width="800" height="100"></canvas>

#### click the buttons to visualize the slice notation

<div class="button-container">
    <button onclick="selectOperation('Full Array')">Full Array slice[:]</button>
    <button onclick="selectOperation('First Half')">First Half slice[:6]</button>
    <button onclick="selectOperation('Second Half')">Second Half slice[6:]</button>
    <button onclick="selectOperation('Middle')">Middle slice[3:8]</button>
    <button onclick="selectOperation('Custom Cap')">Custom Cap slice[3:6:10]</button>
</div>

{{< script "slice_visualizer.js" >}}

---

## Basic Slice Notation: slice[start:end]

- **start:** Where our slice begins, it's starting index.
- **end:** Determines the slice's length as `end - start`, it's ending index.
- **underlying array:** Changes to the slice or array reflect on each other.

```go
nums := [5]int{1, 2, 3, 4, 5}
fullSlice := nums[:]
```

## Full Slice Expression: slice[start:end:cap]

- **cap:** Sets the slice's max growth potential as `cap - start`.
- **underlying array:** This limit ensures slice safety, guarding against
  unintended data overwrites or expansions.

```go
fullSliceWithCap := nums[:5:5]
```

## Variations and Their Effects

### slice[:]

- Includes every element, matching the array's full length and capacity.
- **underlying array:** Fully accessible through the slice.

```go
fullSlice := nums[:]
```

### slice[start:]

- Ends at the array's last element, revealing elements from `start` to end.
- **underlying array:** Partially exposed, with changes affecting `start` onwards.

```go
secondHalf := nums[5:]
```

### slice[:end]

- Begins at element zero, ending just before `end`.
- **underlying array:** Shows the initial segment, with alterations up to `end-1`.

```go
firstHalf := nums[:5]
```

### slice[start:end]

- A precise segment from `start` to `end` for exact control.
- **underlying array:** Affected within the specified range.

```go
middleSection := nums[2:7]
```

### slice[start:end:cap]

- Adds a capacity ceiling to prevent extending beyond `cap`.
- **underlying array:** Maintains controlled exposure with `cap` acting as a boundary.

```go
customCapSlice := nums[2:5:7]
```

## The Underlying Array's Role

Creating a slice from an array, or another slice, is like opening a window
into that array, defined by the slice length and capacity:

- **length:** Current element count within the slice.
- **capacity:** The slice's expansion limit before it must allocate a new
  array, beginning from the original array's starting index.

Remember, slices are mere _references_ to arrays. Modifying a slice's
elements alters the underlying array. This shared reference model underscores
the importance of understanding slice dynamics for data integrity and
efficient resource use.

### Memory Allocation, the slice or the array?

You may be asking yourself, if slices are windows into an array, which one of them
actually consumes the memory? Well, it's pretty straight forward.

Slices do take up some memory, separate from the memory consumed by the array they
reference. This is because a slice in Go is just a data structure with three
components, look at the below taken directly from the Go source code.

[Slice Source](https://github.com/golang/go/blob/master/src/runtime/slice.go#L15-L19)
```go
type slice struct {
	array unsafe.Pointer
	len   int
	cap   int
}
```

So, both the slice and the array consume memory, but they do so differently:

- The array consumes memory based on its size, storing the actual data.
- The slice consumes a smaller, fixed amount of memory to maintain its window into
  the array, the pointer, length, and capacity.

## Practical Takeaways

- **Performance:** Slices minimize data duplication, enabling swift manipulations.
- **Memory Management:** Grasping slice capacity and its relationship with the
  underlying array aids in avoiding memory inefficiencies.
- **Data Integrity:** Managing slices cautiously helps prevent unintended changes
  to the underlying array, safeguarding shared data.

**Happy Coding Friends!**

